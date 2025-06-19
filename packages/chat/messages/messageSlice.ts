import { RootState } from "app/store";
import {
  createSelector,
  asyncThunkCreator,
  buildCreateSlice,
  createEntityAdapter,
  EntityState,
  PayloadAction,
} from "@reduxjs/toolkit";
import { DataType } from "create/types";
import { remove, write, read } from "database/dbSlice";
import { deleteDialogMsgsAction } from "./actions/deleteDialogMsgsAction";
import type { Message } from "./types";
import { selectCurrentServer } from "setting/settingSlice";
import { selectCurrentToken, selectCurrentUserId } from "auth/authSlice";
import { fetchMessages as fetchLocalMessages } from "chat/messages/fetchMessages";
import { fetchConvMsgs } from "./fetchConvMsgs";
import { browserDb } from "database/browser/db";
import { SERVERS } from "database/requests";
import { createDialogMessageKeyAndId } from "database/keys";
import { extractCustomId } from "core/prefix";
import { DialogConfig } from "../dialog/types";
import { toolExecutors } from "ai/tools/toolRegistry"; // ✨ 新增 import

const FALLBACK_SERVERS = [SERVERS.MAIN, SERVERS.US];
const OLDER_LOAD_LIMIT = 30;
const isValidMessage = (msg: any): msg is Message =>
  msg && typeof msg === "object" && typeof msg.id === "string";

const messagesAdapter = createEntityAdapter<Message>({
  selectId: (message) => message.id,
  sortComparer: (a, b) => a.id.localeCompare(b.id),
});

export interface MessageSliceState {
  msgs: EntityState<Message>;
  firstStreamProcessed: boolean;
  isLoadingInitial: boolean;
  isLoadingOlder: boolean;
  hasMoreOlder: boolean;
  error: Error | null;
  lastStreamTimestamp: number;
}

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

const initialState: MessageSliceState = {
  msgs: messagesAdapter.getInitialState(),
  firstStreamProcessed: false,
  isLoadingInitial: false,
  isLoadingOlder: false,
  hasMoreOlder: true,
  error: null,
  lastStreamTimestamp: 0,
};

const pendingHandler =
  (loadingKey: "isLoadingInitial" | "isLoadingOlder") =>
  (state: MessageSliceState) => {
    state[loadingKey] = true;
    state.error = null;
  };

const rejectedHandler =
  (loadingKey: "isLoadingInitial" | "isLoadingOlder") =>
  (state: MessageSliceState, action: any) => {
    state[loadingKey] = false;
    state.error =
      action.error instanceof Error
        ? action.error
        : new Error(String(action.error));
    console.error(`${action.type} failed:`, action.error);
  };

// ===================================================================
// ✨ 1. 新增: 工具处理辅助函数 (从外部迁移)
// ===================================================================

async function processToolData(
  toolCall: any,
  thunkApi: any,
  cybotConfig: any,
  messageId: string
): Promise<{ content?: any; agentTookOver?: boolean }> {
  const func = toolCall.function;
  if (!func || !func.name) {
    return { content: { type: "text", text: "[Tool Error] 工具调用数据无效" } };
  }

  const toolName = func.name;
  let toolArgs = func.arguments;

  try {
    if (typeof toolArgs === "string") {
      if (toolArgs.trim() === "") {
        toolArgs = {};
      } else if (
        toolArgs.trim().startsWith("{") ||
        toolArgs.trim().startsWith("[")
      ) {
        try {
          toolArgs = JSON.parse(toolArgs);
        } catch (_e) {}
      }
    } else if (toolArgs === undefined || toolArgs === null) {
      toolArgs = {};
    }

    const handler = toolExecutors[toolName];
    if (!handler) {
      return {
        content: { type: "text", text: `[Tool Error] 未知工具: ${toolName}` },
      };
    }

    if (toolName === "run_streaming_agent") {
      try {
        await handler(toolArgs, thunkApi, { parentMessageId: messageId });
        return { agentTookOver: true };
      } catch (error: any) {
        return {
          content: {
            type: "text",
            text: `[Tool Error] 启动 Agent 失败: ${error.message}`,
          },
        };
      }
    }

    const result = await handler(toolArgs, thunkApi);
    if (result && result.success) {
      const text =
        result.text ||
        `${toolName
          .replace(/_/g, " ")
          .replace(/^./, (c) => c.toUpperCase())} 已成功执行：${
          result.title || result.name || "操作完成"
        } (ID: ${result.id || "N/A"})`;
      return { content: { type: "text", text } };
    } else {
      return {
        content: {
          type: "text",
          text: `[Tool Error] ${toolName} 操作未返回预期结果。`,
        },
      };
    }
  } catch (e: any) {
    return {
      content: {
        type: "text",
        text: `[Tool Error] 处理 ${toolName} 时发生内部错误: ${e.message}`,
      },
    };
  }
}

async function handleAccumulatedToolCallsInternal(
  accumulatedCalls: any[],
  currentContentBuffer: any[],
  thunkApi: any,
  cybotConfig: any,
  messageId: string
): Promise<{ finalContentBuffer: any[]; agentTookOver: boolean }> {
  let updatedContentBuffer = [...currentContentBuffer];
  let agentHasTakenOver = false;
  const { dispatch } = thunkApi;

  if (accumulatedCalls.length > 0) {
    for (const toolCall of accumulatedCalls) {
      if (
        !toolCall.function ||
        !toolCall.function.name ||
        toolCall.function.arguments === undefined
      ) {
        continue;
      }
      try {
        const { content: toolResult, agentTookOver } = await processToolData(
          toolCall,
          thunkApi,
          cybotConfig,
          messageId
        );

        if (agentTookOver) {
          agentHasTakenOver = true;
          break;
        }

        if (toolResult) {
          updatedContentBuffer = [...updatedContentBuffer, toolResult];
          dispatch(
            messageSlice.actions.messageStreaming({
              id: messageId,
              content: updatedContentBuffer,
              role: "assistant",
              cybotKey: cybotConfig.dbKey,
            })
          );
        }
      } catch (toolError: any) {
        const errorResult = {
          type: "text",
          text: `\n[Tool 执行异常: ${toolError.message}]`,
        };
        updatedContentBuffer = [...updatedContentBuffer, errorResult];
        dispatch(
          messageSlice.actions.messageStreaming({
            id: messageId,
            content: updatedContentBuffer,
            role: "assistant",
            cybotKey: cybotConfig.dbKey,
          })
        );
      }
    }
  }
  return {
    finalContentBuffer: updatedContentBuffer,
    agentTookOver: agentHasTakenOver,
  };
}

// ✨ 2. 定义新 Thunk 的 Payload 类型
interface HandleToolCallsPayload {
  accumulatedCalls: any[];
  currentContentBuffer: any[];
  cybotConfig: any;
  messageId: string;
}

export const messageSlice = createSliceWithThunks({
  name: "message",
  initialState,
  reducers: (create) => ({
    addUserMessage: create.reducer<Message>((state, action) => {
      messagesAdapter.upsertOne(state.msgs, {
        ...action.payload,
        isStreaming: false,
      });
    }),
    messageStreaming: create.reducer<Message>((state, action) => {
      messagesAdapter.upsertOne(state.msgs, {
        isStreaming: true,
        content: "",
        thinkContent: "",
        ...action.payload,
      });
      state.firstStreamProcessed = true;
      state.lastStreamTimestamp = Date.now();
    }),
    resetMsgs: create.reducer((state) => {
      messagesAdapter.removeAll(state.msgs);
      Object.assign(state, initialState);
    }),
    prepareAndPersistUserMessage: create.asyncThunk(
      async (
        args: { userInput: string; dialogConfig: DialogConfig },
        thunkApi
      ) => {
        const { userInput, dialogConfig } = args;
        const { getState, dispatch, rejectWithValue } = thunkApi;
        const state = getState() as RootState;
        if (!dialogConfig) {
          return rejectWithValue("Missing dialogConfig");
        }
        const dialogKey = dialogConfig.dbKey || dialogConfig.id;
        const dialogId = extractCustomId(dialogKey);
        const userId = selectCurrentUserId(state);
        const { key: messageDbKey, messageId } =
          createDialogMessageKeyAndId(dialogId);
        const userMsg: Message = {
          id: messageId,
          dbKey: messageDbKey,
          role: "user",
          content: userInput,
          userId,
        };
        dispatch(messageSlice.actions.addUserMessage(userMsg));
        const { controller, ...messageToWrite } = userMsg;
        dispatch(
          write({
            data: { ...messageToWrite, type: DataType.MSG },
            customKey: userMsg.dbKey,
          })
        );
        return userMsg;
      }
    ),
    initMsgs: create.asyncThunk(
      async (
        {
          dialogId,
          limit,
          db = browserDb,
        }: { dialogId: string; limit?: number; db?: any },
        { getState }
      ): Promise<Message[]> => {
        const state = getState() as RootState;
        const server = selectCurrentServer(state);
        const token = selectCurrentToken(state);
        const fetchLocalPromise = fetchLocalMessages(db, dialogId, {
          limit,
          throwOnError: false,
        }).catch(() => []);
        const fetchRemotePromise = (async () => {
          if (!server || !token) return [];
          const uniqueServers = Array.from(
            new Set([server, ...FALLBACK_SERVERS])
          ).filter(Boolean) as string[];
          if (uniqueServers.length === 0) return [];
          const results = await Promise.all(
            uniqueServers.map((srv) =>
              fetchConvMsgs(srv, token, { dialogId, limit }).catch(() => [])
            )
          );
          return results.flat();
        })();
        const [localMessages, remoteMessages] = await Promise.all([
          fetchLocalPromise,
          fetchRemotePromise,
        ]);
        const allMessages = [...localMessages, ...remoteMessages].filter(
          isValidMessage
        );
        const uniqueMessagesMap = new Map<string, Message>();
        allMessages.forEach((msg) => uniqueMessagesMap.set(msg.id, msg));
        return Array.from(uniqueMessagesMap.values());
      },
      {
        pending: (state) => {
          messagesAdapter.removeAll(state.msgs);
          Object.assign(state, { ...initialState, isLoadingInitial: true });
        },
        fulfilled: (state, action) => {
          state.isLoadingInitial = false;
          messagesAdapter.upsertMany(state.msgs, action.payload);
        },
        rejected: rejectedHandler("isLoadingInitial"),
      }
    ),
    loadOlderMessages: create.asyncThunk(
      async (
        {
          dialogId,
          beforeKey,
          limit = OLDER_LOAD_LIMIT,
          db = browserDb,
        }: { dialogId: string; beforeKey: string; limit?: number; db?: any },
        { getState }
      ): Promise<{ messages: Message[]; limit: number }> => {
        const state = getState() as RootState;
        const server = selectCurrentServer(state);
        const token = selectCurrentToken(state);
        const fetchLocalPromise = fetchLocalMessages(db, dialogId, {
          limit,
          beforeKey,
          throwOnError: false,
        }).catch(() => []);
        const fetchRemotePromise = (async () => {
          if (!server || !token) return [];
          const uniqueServers = Array.from(
            new Set([server, ...FALLBACK_SERVERS])
          ).filter(Boolean) as string[];
          if (uniqueServers.length === 0) return [];
          const results = await Promise.all(
            uniqueServers.map((srv) =>
              fetchConvMsgs(srv, token, { dialogId, limit, beforeKey }).catch(
                () => []
              )
            )
          );
          return results.flat();
        })();
        const [localMessages, remoteMessages] = await Promise.all([
          fetchLocalPromise,
          fetchRemotePromise,
        ]);
        const allMessages = [...localMessages, ...remoteMessages].filter(
          isValidMessage
        );
        const uniqueMessagesMap = new Map<string, Message>();
        allMessages.forEach((msg) => uniqueMessagesMap.set(msg.id, msg));
        return { messages: Array.from(uniqueMessagesMap.values()), limit };
      },
      {
        pending: pendingHandler("isLoadingOlder"),
        fulfilled: (state, action) => {
          state.isLoadingOlder = false;
          const { messages, limit } = action.payload;
          if (messages.length > 0) {
            messagesAdapter.upsertMany(state.msgs, messages);
          }
          if (messages.length < limit) {
            state.hasMoreOlder = false;
          }
        },
        rejected: rejectedHandler("isLoadingOlder"),
      }
    ),

    // ✨ ✨ ✨ 3. 新增的 Thunk 用于处理工具调用 ✨ ✨ ✨
    handleToolCalls: create.asyncThunk(
      async (args: HandleToolCallsPayload, thunkApi) => {
        const {
          accumulatedCalls,
          currentContentBuffer,
          cybotConfig,
          messageId,
        } = args;

        const result = await handleAccumulatedToolCallsInternal(
          accumulatedCalls,
          currentContentBuffer,
          thunkApi,
          cybotConfig,
          messageId
        );

        // 返回结果给调用方 (sendCommonChatRequest)
        return result;
      }
    ),

    messageStreamEnd: create.asyncThunk(
      async (msg: Message, { dispatch }) => {
        const { controller, ...messageToWrite } = msg;
        await dispatch(
          write({
            data: { ...messageToWrite, type: DataType.MSG },
            customKey: msg.dbKey,
          })
        );
        return { id: msg.id };
      },
      {
        fulfilled: (state, action) => {
          messagesAdapter.updateOne(state.msgs, {
            id: action.payload.id,
            changes: { isStreaming: false },
          });
        },
        rejected: (state, action) => {
          console.error("messageStreamEnd failed:", action.error);
          const messageId = action.meta?.arg?.id;
          if (messageId) {
            messagesAdapter.updateOne(state.msgs, {
              id: messageId,
              changes: { isStreaming: false },
            });
          }
        },
      }
    ),
    deleteMessage: create.asyncThunk(
      async (dbKey: string, { dispatch, getState }) => {
        const state = getState() as RootState;
        const msgId = Object.values(state.message.msgs.entities).find(
          (msg) => msg?.dbKey === dbKey
        )?.id;
        await dispatch(remove(dbKey));
        return { id: msgId };
      },
      {
        fulfilled: (state, action) => {
          if (action.payload.id) {
            messagesAdapter.removeOne(state.msgs, action.payload.id);
          }
        },
      }
    ),
    deleteDialogMsgs: create.asyncThunk(deleteDialogMsgsAction),
  }),
  selectors: {
    selectMsgsState: (state) => state.msgs,
    selectFirstStreamProcessed: (state) => state.firstStreamProcessed,
    selectIsLoadingInitial: (state) => state.isLoadingInitial,
    selectIsLoadingOlder: (state) => state.isLoadingOlder,
    selectHasMoreOlder: (state) => state.hasMoreOlder,
    selectMessageError: (state) => state.error,
    selectLastStreamTimestamp: (state) => state.lastStreamTimestamp,
  },
});

const baseSelectors = messagesAdapter.getSelectors<RootState>(
  (state) => state.message.msgs
);
export const selectAllMsgs = baseSelectors.selectAll;
export const selectMsgById = baseSelectors.selectById;
export const selectTotalMsgs = baseSelectors.selectTotal;

export const {
  selectFirstStreamProcessed,
  selectIsLoadingInitial,
  selectIsLoadingOlder,
  selectHasMoreOlder,
  selectMessageError,
  selectLastStreamTimestamp,
} = messageSlice.selectors;

export const selectMessagesLoadingState = createSelector(
  [
    selectIsLoadingInitial,
    selectIsLoadingOlder,
    selectHasMoreOlder,
    selectMessageError,
  ],
  (isLoadingInitial, isLoadingOlder, hasMoreOlder, error) => ({
    isLoadingInitial,
    isLoadingOlder,
    hasMoreOlder,
    error,
  })
);

export const {
  addUserMessage,
  messageStreaming,
  resetMsgs,
  prepareAndPersistUserMessage,
  initMsgs,
  loadOlderMessages,
  messageStreamEnd,
  deleteMessage,
  deleteDialogMsgs,
  handleToolCalls, // ✨ 4. 导出新的 action
} = messageSlice.actions;

export default messageSlice.reducer;
