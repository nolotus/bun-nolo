import { RootState } from "app/store";
import {
  createSelector,
  asyncThunkCreator,
  buildCreateSlice,
  createEntityAdapter,
  EntityState,
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
import { SERVERS } from "database/requests"; // <--- 【优化1】导入集中的服务器地址

// sendMessageAction 所需的依赖
import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";
import { extractCustomId } from "core/prefix";
import { createDialogMessageKeyAndId } from "database/keys";
import { DialogInvocationMode } from "chat/dialog/types";
import { streamCybotId } from "ai/cybot/cybotSlice";
import { requestHandlers } from "ai/llm/providers";

// --- 常量与工具函数 ---
const FALLBACK_SERVERS = [SERVERS.MAIN, SERVERS.US]; // <--- 【优化1】使用导入的常量
const OLDER_LOAD_LIMIT = 30;
const isValidMessage = (msg: any): msg is Message =>
  msg && typeof msg === "object" && typeof msg.id === "string";

// --- 实体适配器 ---
const messagesAdapter = createEntityAdapter<Message>({
  selectId: (message) => message.id,
  sortComparer: (a, b) => a.id.localeCompare(b.id),
});

// --- State 接口 ---
export interface MessageSliceState {
  msgs: EntityState<Message>;
  firstStreamProcessed: boolean;
  isLoadingInitial: boolean;
  isLoadingOlder: boolean;
  hasMoreOlder: boolean;
  error: Error | null;
}

// --- Slice 创建设置 ---
const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

// --- 初始状态 ---
const initialState: MessageSliceState = {
  msgs: messagesAdapter.getInitialState(),
  firstStreamProcessed: false,
  isLoadingInitial: false,
  isLoadingOlder: false,
  hasMoreOlder: true,
  error: null,
};

// --- Thunk 状态处理辅助函数 ---
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

// --- Message Slice ---
export const messageSlice = createSliceWithThunks({
  name: "message",
  initialState,
  reducers: (create) => ({
    // --- 同步 Reducers ---
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
    }),

    resetMsgs: create.reducer((state) => {
      messagesAdapter.removeAll(state.msgs);
      Object.assign(state, initialState);
    }),

    // --- 异步 Thunks ---
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
        }).catch((err) => {
          console.error("initMsgs: Failed to fetch local messages", err);
          return [];
        });

        const fetchRemotePromise = (async () => {
          if (!server || !token) return [];
          const uniqueServers = Array.from(
            new Set([server, ...FALLBACK_SERVERS])
          ).filter(Boolean) as string[];
          if (uniqueServers.length === 0) return [];

          const results = await Promise.all(
            uniqueServers.map((srv) =>
              fetchConvMsgs(srv, token, { dialogId, limit }).catch((err) => {
                console.error(`initMsgs: Failed to fetch from ${srv}`, err);
                return [];
              })
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
          state.firstStreamProcessed = false;
          state.isLoadingInitial = true;
          state.isLoadingOlder = false;
          state.hasMoreOlder = true;
          state.error = null;
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
        }).catch((err) => {
          console.error("loadOlderMessages: Failed local fetch", err);
          return [];
        });

        const fetchRemotePromise = (async () => {
          if (!server || !token) return [];
          const uniqueServers = Array.from(
            new Set([server, ...FALLBACK_SERVERS])
          ).filter(Boolean) as string[];
          if (uniqueServers.length === 0) return [];
          const results = await Promise.all(
            uniqueServers.map((srv) =>
              fetchConvMsgs(srv, token, { dialogId, limit, beforeKey }).catch(
                (err) => {
                  console.error(
                    `loadOlderMessages: Failed remote fetch from ${srv}`,
                    err
                  );
                  return [];
                }
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
        rejected: (state, action) => {
          console.error("deleteMessage failed:", action.error);
        },
      }
    ),

    handleSendMessage: create.asyncThunk(
      async (args: { userInput: string }, thunkApi) => {
        const { userInput } = args;
        const state = thunkApi.getState() as RootState;
        const dispatch = thunkApi.dispatch;

        const dialogConfig = selectCurrentDialogConfig(state);
        const dialogKey = dialogConfig?.dbKey || dialogConfig?.id;
        if (!dialogKey) {
          console.error("handleSendMessage: Missing dialogKey or dialogConfig");
          throw new Error("Current dialog configuration is missing.");
        }
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

        dispatch(addUserMessage(userMsg));

        // 【优化2】净化写入数据库的数据对象，移除任何潜在的前端专用字段
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { controller, ...messageToWrite } = userMsg;
        dispatch(
          write({
            data: { ...messageToWrite, type: DataType.MSG },
            customKey: userMsg.dbKey,
          })
        );

        const mode = dialogConfig?.mode;
        const cybots = dialogConfig?.cybots || [];

        try {
          if (mode === DialogInvocationMode.PARALLEL) {
            const cybotPromises = cybots.map((cybotId) =>
              dispatch(streamCybotId({ cybotId, userInput }))
                .unwrap()
                .catch((error) =>
                  console.error(
                    `Error in PARALLEL mode for cybot ${cybotId}:`,
                    error
                  )
                )
            );
            await Promise.all(cybotPromises);
          } else if (mode === DialogInvocationMode.SEQUENTIAL) {
            for (const cybotId of cybots) {
              await dispatch(streamCybotId({ cybotId, userInput })).unwrap();
            }
          } else if (mode === DialogInvocationMode.ORCHESTRATED) {
            console.log(
              "ORCHESTRATED mode selected, but decision logic is a TODO."
            );
            const selectedCybots: string[] = [];

            for (const cybotId of selectedCybots) {
              const cybotConfig = await dispatch(read(cybotId)).unwrap();
              const bodyData = {};
              const providerName = cybotConfig.provider.toLowerCase();
              const handler = requestHandlers[providerName];
              if (handler) {
                await handler({ bodyData, cybotConfig, thunkApi, dialogKey });
              } else {
                throw new Error(
                  `Unsupported provider: ${cybotConfig.provider}`
                );
              }
            }
          } else {
            // 默认或 FIRST 模式
            if (cybots.length > 0) {
              const firstCybotId = cybots[0];
              await dispatch(
                streamCybotId({ cybotId: firstCybotId, userInput })
              ).unwrap();
            }
          }
        } catch (error) {
          console.error(
            `Error during cybot invocation in mode '${mode}':`,
            error
          );
        }
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
  },
});

// --- 导出 Selectors ---
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

// --- 导出 Actions ---
export const {
  addUserMessage,
  messageStreaming,
  resetMsgs,
  initMsgs,
  loadOlderMessages,
  messageStreamEnd,
  deleteMessage,
  handleSendMessage,
  deleteDialogMsgs,
} = messageSlice.actions;

// --- 导出 Reducer ---
export default messageSlice.reducer;
