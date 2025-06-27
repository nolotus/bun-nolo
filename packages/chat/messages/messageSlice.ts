/*
 * ==================================================================
 *  /chat/messages/messageSlice.ts (Corrected)
 * ==================================================================
 *  此版本修复了 messageStreamEnd thunk，确保在消息流结束后，
 *  Redux store 中的消息内容能够与数据库同步更新，从而实现实时UI刷新。
 */

import { RootState } from "app/store";
import {
  createSelector,
  asyncThunkCreator,
  buildCreateSlice,
  createEntityAdapter,
  EntityState,
} from "@reduxjs/toolkit";
import { DataType } from "create/types";
import { remove, write } from "database/dbSlice";
import { deleteDialogMsgsAction } from "./actions/deleteDialogMsgsAction";
import type { Message } from "./types";
import { selectCurrentServer } from "setting/settingSlice";
import { selectCurrentToken, selectUserId } from "auth/authSlice";
import { fetchMessages as fetchLocalMessages } from "chat/messages/fetchMessages";
import { fetchConvMsgs } from "./fetchConvMsgs";
import { browserDb } from "database/browser/db";
import { SERVERS } from "database/requests";
import { createDialogMessageKeyAndId } from "database/keys";
import { extractCustomId } from "core/prefix";
import { DialogConfig } from "app/types";
import { findToolExecutor } from "ai/tools/toolRegistry";
import { updateDialogTitle, updateTokens } from "chat/dialog/dialogSlice";
import { streamAgentChatTurn } from "ai/cybot/cybotSlice";

const FALLBACK_SERVERS = [SERVERS.MAIN, SERVERS.US];
const OLDER_LOAD_LIMIT = 30;
const isValidMessage = (msg: any): msg is Message =>
  msg && typeof msg === "object" && typeof msg.id === "string";

function separateThinkContent(contentBuffer: any[]) {
  let thinkContent = "";
  let normalContent = "";
  const combinedText = contentBuffer
    .filter((c) => c.type === "text" && c.text)
    .map((c) => c.text)
    .join("");
  const thinkMatches = combinedText.match(/<think\b[^>]*>(.*?)<\/think>/gis);
  if (thinkMatches) {
    thinkContent = thinkMatches
      .map((m) => m.replace(/<think\b[^>]*>|<\/think>/gi, ""))
      .join("\n\n");
    normalContent = combinedText
      .replace(/<think\b[^>]*>.*?<\/think>/gis, "")
      .trim();
  } else {
    normalContent = combinedText;
  }
  return { thinkContent, normalContent };
}

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

interface HandleToolCallsPayload {
  accumulatedCalls: any[];
  currentContentBuffer: any[];
  cybotConfig: any;
  messageId: string;
}

interface ProcessToolDataPayload {
  toolCall: any;
  parentMessageId: string;
}

interface FinalizeStreamPayload {
  finalContentBuffer: any[];
  totalUsage: any;
  msgKey: string;
  cybotConfig: any;
  dialogId: string;
  dialogKey: string;
  messageId: string;
  reasoningBuffer: string;
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
    messageStreaming: create.reducer<Partial<Message> & { id: string }>(
      (state, action) => {
        messagesAdapter.upsertOne(state.msgs, {
          isStreaming: true,
          content: "",
          thinkContent: "",
          ...action.payload,
        });
        state.firstStreamProcessed = true;
        state.lastStreamTimestamp = Date.now();
      }
    ),
    resetMsgs: create.reducer((state) => {
      messagesAdapter.removeAll(state.msgs);
      Object.assign(state, initialState);
    }),
    // ================= [START] NEW GENERIC THUNK =================
    prepareAndPersistMessage: create.asyncThunk(
      async (
        args: {
          message: Omit<Message, "id" | "dbKey" | "userId">;
          dialogConfig: DialogConfig;
        },
        thunkApi
      ) => {
        const { message, dialogConfig } = args;
        const { getState, dispatch, rejectWithValue } = thunkApi;
        const state = getState() as RootState;

        if (!dialogConfig) {
          return rejectWithValue("Missing dialogConfig");
        }

        const dialogKey = dialogConfig.dbKey || dialogConfig.id;
        const dialogId = extractCustomId(dialogKey);
        const userId = selectUserId(state);
        const { key: messageDbKey, messageId } =
          createDialogMessageKeyAndId(dialogId);

        const fullMessage: Message = {
          ...message,
          id: messageId,
          dbKey: messageDbKey,
          userId,
        };

        dispatch(messageSlice.actions.addUserMessage(fullMessage));

        const { controller, ...messageToWrite } = fullMessage;
        dispatch(
          write({
            data: { ...messageToWrite, type: DataType.MSG },
            customKey: fullMessage.dbKey,
          })
        );
        return fullMessage;
      }
    ),
    // ================= [END] NEW GENERIC THUNK =================

    // ================= [START] ADJUSTED USER MESSAGE THUNK =================
    prepareAndPersistUserMessage: create.asyncThunk(
      async (
        args: { userInput: string; dialogConfig: DialogConfig },
        thunkApi
      ) => {
        const { userInput, dialogConfig } = args;
        const { dispatch } = thunkApi;

        // Delegate to the new generic thunk
        return dispatch(
          messageSlice.actions.prepareAndPersistMessage({
            message: {
              role: "user",
              content: userInput,
            },
            dialogConfig,
          })
        ).unwrap();
      }
    ),
    // ================= [END] ADJUSTED USER MESSAGE THUNK =================
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
    processToolData: create.asyncThunk(
      async (args: ProcessToolDataPayload, thunkApi) => {
        const { toolCall, parentMessageId } = args;
        const { dispatch, rejectWithValue } = thunkApi;

        const func = toolCall.function;
        if (!func || !func.name) {
          throw new Error(
            "Invalid tool call data: missing function or function.name"
          );
        }

        const rawToolName = func.name;
        let toolArgs = func.arguments;

        try {
          const { executor: handler, canonicalName } =
            findToolExecutor(rawToolName);

          if (typeof toolArgs === "string") {
            try {
              toolArgs = JSON.parse(toolArgs);
            } catch (e) {
              throw new Error(`Failed to parse tool arguments JSON: ${e}`);
            }
          }

          if (canonicalName === "runStreamingAgent") {
            try {
              await dispatch(
                streamAgentChatTurn({
                  cybotId: toolArgs.agentKey,
                  userInput: toolArgs.userInput,
                  parentMessageId: parentMessageId,
                })
              ).unwrap();
              return { hasHandedOff: true };
            } catch (e: any) {
              const errorContent = {
                type: "text",
                text: `\n[Agent Failed to Start] ${e.message}\n`,
              };
              return rejectWithValue({ displayContent: errorContent });
            }
          }

          const toolResult = await handler(toolArgs, thunkApi, {
            parentMessageId,
          });

          let displayContent;
          const displayData = toolResult?.displayData;

          if (canonicalName === "createPlan") {
            displayContent = {
              type: "text",
              text:
                displayData || "[Plan executed, but no report was generated.]",
            };
          } else {
            const text =
              displayData ||
              `${canonicalName.replace(/_/g, " ")} executed successfully.`;
            displayContent = {
              type: "text",
              text: `\n[Tool Result: ${text}]\n`,
            };
          }

          return {
            displayContent,
            rawResult: toolResult.rawData,
            hasHandedOff: false,
          };
        } catch (e: any) {
          const errorMessage = e.message || "Unknown error";
          const errorContent = {
            type: "text",
            text: `\n[Tool Execution Error: ${rawToolName}] ${errorMessage}\n`,
          };
          return rejectWithValue({
            displayContent: errorContent,
            rawResult: { error: errorMessage },
          });
        }
      }
    ),
    handleToolCalls: create.asyncThunk(
      async (args: HandleToolCallsPayload, thunkApi) => {
        const {
          accumulatedCalls,
          currentContentBuffer,
          cybotConfig,
          messageId,
        } = args;
        const { dispatch } = thunkApi;

        let updatedContentBuffer = [...currentContentBuffer];
        let hasHandedOff = false;

        for (const toolCall of accumulatedCalls) {
          if (!toolCall.function?.name) continue;

          try {
            const result = await dispatch(
              messageSlice.actions.processToolData({
                toolCall,
                parentMessageId: messageId,
              })
            ).unwrap();

            if (result.hasHandedOff) {
              hasHandedOff = true;
              break;
            }
            if (result.displayContent) {
              updatedContentBuffer.push(result.displayContent);
            }
          } catch (rejectedValue: any) {
            if (rejectedValue.displayContent) {
              updatedContentBuffer.push(rejectedValue.displayContent);
            }
          }

          if (!hasHandedOff) {
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
        return { finalContentBuffer: updatedContentBuffer, hasHandedOff };
      }
    ),

    // ================= [START] CORRECTED THUNK =================
    messageStreamEnd: create.asyncThunk(
      async (payload: FinalizeStreamPayload, { dispatch }) => {
        const {
          finalContentBuffer,
          totalUsage,
          msgKey,
          cybotConfig,
          dialogId,
          dialogKey,
          messageId,
          reasoningBuffer,
        } = payload;

        const { thinkContent: tagThink, normalContent } =
          separateThinkContent(finalContentBuffer);

        const thinkContent = (tagThink + reasoningBuffer).trim();

        const finalUsageData =
          totalUsage && totalUsage.completion_tokens != null
            ? { completion_tokens: totalUsage.completion_tokens }
            : undefined;

        const finalMessage: Message = {
          id: messageId,
          dbKey: msgKey,
          content: normalContent || "",
          thinkContent,
          role: "assistant",
          cybotKey: cybotConfig.dbKey,
          usage: finalUsageData,
          isStreaming: false,
        };

        const { controller, ...messageToWrite } = finalMessage;
        await dispatch(
          write({
            data: { ...messageToWrite, type: DataType.MSG },
            customKey: msgKey,
          })
        );

        if (totalUsage) {
          dispatch(updateTokens({ dialogId, usage: totalUsage, cybotConfig }));
        }

        if ((normalContent || "").trim() !== "") {
          dispatch(updateDialogTitle({ dialogKey, cybotConfig }));
        }

        // [FIX] Return the complete final message data, not just the ID.
        // This allows the reducer to update the Redux state with the final content.
        return {
          id: messageId,
          content: finalMessage.content,
          thinkContent: finalMessage.thinkContent,
          usage: finalMessage.usage,
          cybotKey: finalMessage.cybotKey,
        };
      },
      {
        fulfilled: (state, action) => {
          // [FIX] Use all the data from the payload to update the message in Redux.
          // This ensures the UI updates in real-time without needing a refresh.
          messagesAdapter.updateOne(state.msgs, {
            id: action.payload.id,
            changes: {
              isStreaming: false,
              content: action.payload.content,
              thinkContent: action.payload.thinkContent,
              usage: action.payload.usage,
              cybotKey: action.payload.cybotKey,
            },
          });
        },
        rejected: (state, action) => {
          console.error("messageStreamEnd failed:", action.error);
          const messageId = (action.meta?.arg as FinalizeStreamPayload)
            ?.messageId;
          if (messageId) {
            messagesAdapter.updateOne(state.msgs, {
              id: messageId,
              changes: {
                isStreaming: false,
                content:
                  (state.msgs.entities[messageId]?.content || "") +
                  "\n[Failed to save message]",
              },
            });
          }
        },
      }
    ),
    // ================= [END] CORRECTED THUNK =================

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
  prepareAndPersistMessage, // Export new thunk
  prepareAndPersistUserMessage,
  initMsgs,
  loadOlderMessages,
  messageStreamEnd,
  deleteMessage,
  deleteDialogMsgs,
  handleToolCalls,
  processToolData,
} = messageSlice.actions;

export default messageSlice.reducer;
