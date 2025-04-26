import { NoloRootState } from "app/store";
import { createSelector } from "@reduxjs/toolkit";
import { asyncThunkCreator, buildCreateSlice } from "@reduxjs/toolkit";
import { filter } from "rambda";
import { DataType } from "create/types";
import { remove, write, upsertMany } from "database/dbSlice";
import { sendMessageAction } from "./actions/sendMessageAction";
import { deleteDialogMsgsAction } from "./actions/deleteDialogMsgsAction";
import type { Message } from "./types";
import { selectCurrentServer } from "setting/settingSlice";
import { selectCurrentToken } from "auth/authSlice";
import {
  fetchMessages as fetchLocalMessages,
  MessageWithKey,
} from "chat/messages/fetchMessages";
import { fetchConvMsgs } from "./fetchConvMsgs";
import { createEntityAdapter, EntityState } from "@reduxjs/toolkit";
//web
import { browserDb } from "database/browser/db";

// --- Constants ---
const FALLBACK_SERVERS = ["https://cybot.one", "https://cybot.run"];
const INITIAL_LOAD_LIMIT = 50; // 初始加载数量
const OLDER_LOAD_LIMIT = 30; // 向上滚动加载数量

// --- Utility: isValidMessage ---
const isValidMessage = (msg: any): msg is Message => {
  return (
    msg &&
    typeof msg === "object" &&
    typeof msg.id === "string" &&
    msg.content != null &&
    msg.createdAt != null
  );
};

// 使用 createEntityAdapter 来管理 msgs
const messagesAdapter = createEntityAdapter<Message>({
  selectId: (message) => message.id,
  sortComparer: (a, b) => a.id.localeCompare(b.id), // 基于 id 的字符串排序
});

export interface MessageSliceState {
  msgs: EntityState<Message>; // 使用 EntityState 来管理 msgs
  firstStreamProcessed: boolean;
  isLoadingInitial: boolean;
  isLoadingOlder: boolean;
  hasMoreOlder: boolean;
  error: Error | null;
}

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

const initialState: MessageSliceState = {
  msgs: messagesAdapter.getInitialState(), // 使用 adapter 的初始状态
  firstStreamProcessed: false,
  isLoadingInitial: false,
  isLoadingOlder: false,
  hasMoreOlder: true,
  error: null,
};

export const messageSlice = createSliceWithThunks({
  name: "message",
  initialState: initialState as MessageSliceState,
  reducers: (create) => ({
    // initMsgs 作为 async thunk
    initMsgs: create.asyncThunk(
      async (
        options: {
          dialogId: string;
          limit?: number;
          db?: any;
        },
        thunkApi
      ) => {
        const {
          dialogId,
          limit = INITIAL_LOAD_LIMIT,
          db = browserDb,
        } = options;
        const { dispatch } = thunkApi;

        console.log("initMsgs: Fetching initial local messages");
        await dispatch(
          fetchInitialLocalMessagesAction({ dialogId, limit, db })
        ).unwrap();

        console.log("initMsgs: Fetching initial remote messages");
        await dispatch(
          fetchInitialRemoteMessagesAction({ dialogId, limit })
        ).unwrap();

        return { dialogId };
      },
      {
        pending: (state) => {
          state.isLoadingInitial = true;
          state.error = null;
          messagesAdapter.removeAll(state.msgs); // 重置消息列表
          state.firstStreamProcessed = false; // 重置流处理标志
          console.log("initMsgs: Initialization started");
        },
        fulfilled: (state, action) => {
          state.isLoadingInitial = false;
          console.log(
            `initMsgs: Initialization completed for dialog ${action.payload.dialogId}`
          );
        },
        rejected: (state, action) => {
          state.isLoadingInitial = false;
          state.error =
            action.error instanceof Error
              ? action.error
              : new Error(String(action.error));
          console.error("initMsgs: Initialization failed", action.error);
        },
      }
    ),

    messageStreamEnd: create.asyncThunk(
      async (msg: Message, thunkApi) => {
        const { dispatch } = thunkApi;
        console.log("messageStreamEnd: Writing final message", msg.id); // Log id for clarity

        // Create a version of the message without the controller for writing
        // Although 'write' might handle extra fields, it's cleaner not to store transient UI state
        const { controller, ...messageToWrite } = msg;

        await dispatch(
          write({
            data: { ...messageToWrite, type: DataType.MSG },
            customKey: msg.dbKey,
          })
        );
        // Return the ID so the reducer knows which message to update
        return { id: msg.id };
      },
      {
        fulfilled: (state, action) => {
          const { id } = action.payload;
          console.log("messageStreamEnd: DB Write fulfilled for id", id);

          // --- START MODIFICATION ---
          // Explicitly remove the controller from the message state in Redux
          const existingMessage = state.msgs.entities[id];
          if (existingMessage && existingMessage.controller) {
            console.log(
              `messageStreamEnd: Removing controller for message ${id}`
            );
            // Prepare the update payload to remove the controller
            const update: Update<Message> = {
              id: id,
              changes: { controller: undefined }, // Set controller to undefined
            };
            messagesAdapter.updateOne(state.msgs, update);
          } else if (existingMessage) {
            console.log(
              `messageStreamEnd: Controller already removed or never existed for message ${id}`
            );
          } else {
            console.warn(
              `messageStreamEnd: Message with id ${id} not found in state for controller removal.`
            );
          }
          // --- END MODIFICATION ---

          // Keep the original comment if 'write' triggers other updates for content etc.
          // 但我们在这里确保了 controller 被清除
        },
        rejected: (state, action) => {
          console.error("messageStreamEnd failed:", action.error);
          // Optionally, still try to remove the controller if the write failed but stream ended
          // This depends on whether msg.id is available in action.meta.arg or similar
          // Example (needs adjustment based on actual toolkit behavior):
          // const messageWithError = action.meta.arg as Message;
          // if (messageWithError?.id) {
          //   const id = messageWithError.id;
          //   const existingMessage = state.msgs.entities[id];
          //   if (existingMessage && existingMessage.controller) {
          //     console.warn(`messageStreamEnd (rejected): Removing controller for message ${id} despite write error.`);
          //     const update: Update<Message> = { id: id, changes: { controller: undefined } };
          //     messagesAdapter.updateOne(state.msgs, update);
          //   }
          // }
        },
      }
    ),

    messageStreaming: create.reducer<Message>((state, action) => {
      const message = action.payload;
      console.log("messageStreaming: Processing streaming message", message.id);
      // 直接将流式消息写入 msgs
      messagesAdapter.upsertOne(state.msgs, message);
      if (!state.firstStreamProcessed) {
        console.log("messageStreaming: First stream processed flag set");
        state.firstStreamProcessed = true;
      }
    }),

    deleteMessage: create.asyncThunk(
      async (dbKey: string, thunkApi) => {
        await thunkApi.dispatch(remove(dbKey));
        return { dbKey };
      },
      {
        fulfilled: (state, action) => {
          const dbKeyToRemove = action.payload.dbKey;
          console.log(
            "deleteMessage: Removing message with dbKey",
            dbKeyToRemove
          );
          // 从 msgs 中移除对应的消息（需要找到对应的 id）
          const msgToRemove = Object.values(state.msgs.entities).find(
            (msg) => msg?.dbKey === dbKeyToRemove
          );
          if (msgToRemove) {
            messagesAdapter.removeOne(state.msgs, msgToRemove.id);
          }
        },
        rejected: (state, action) => {
          console.error("deleteMessage failed:", action.error);
        },
      }
    ),

    handleSendMessage: create.asyncThunk(sendMessageAction),

    deleteDialogMsgs: create.asyncThunk(deleteDialogMsgsAction),

    addMsg: create.asyncThunk(
      async (msg: Message, thunkApi) => {
        console.log("addMsg: Writing message", msg.id);
        await thunkApi.dispatch(
          write({
            data: { ...msg, type: DataType.MSG },
            customKey: msg.dbKey,
          })
        );
        return msg;
      },
      {
        fulfilled: (state, action) => {
          const newMessage = action.payload;
          console.log("addMsg: Adding or updating message", newMessage.id);
          messagesAdapter.upsertOne(state.msgs, newMessage);
        },
        rejected: (state, action) => {
          console.error("addMsg failed:", action.error);
        },
      }
    ),

    resetMsgs: create.reducer((state) => {
      console.log("resetMsgs: Clearing all messages and stream state");
      messagesAdapter.removeAll(state.msgs); // 清空 msgs
      state.firstStreamProcessed = false;
    }),

    fetchInitialRemoteMessagesAction: create.asyncThunk(
      async (
        options: {
          dialogId: string;
          limit: number;
        },
        thunkApi
      ) => {
        const { dialogId, limit } = options;
        const state = thunkApi.getState() as NoloRootState;
        const server = selectCurrentServer(state);
        const token = selectCurrentToken(state);

        if (!server || !token) {
          console.warn(
            "fetchInitialRemoteMessagesAction: No server or token available"
          );
          return [];
        }

        try {
          const uniqueServers = Array.from(
            new Set([server, ...FALLBACK_SERVERS])
          ).filter(Boolean) as string[];
          if (uniqueServers.length === 0) return [];

          const remoteResults = await Promise.all(
            uniqueServers.map(async (srv) => {
              return await fetchConvMsgs(srv, token, { dialogId, limit });
            })
          );

          const remoteMessages = remoteResults.flat().filter(isValidMessage);
          console.log(
            `fetchInitialRemoteMessagesAction: Fetched ${remoteMessages.length} remote messages for dialog ${dialogId}`
          );

          if (remoteMessages.length > 0) {
            await thunkApi.dispatch(upsertMany(remoteMessages));
          }

          return remoteMessages;
        } catch (error) {
          console.error(
            "fetchInitialRemoteMessagesAction: Unexpected error:",
            error
          );
          throw error;
        }
      },
      {
        pending: (state) => {
          state.isLoadingInitial = true;
          state.error = null;
          console.log("fetchInitialRemoteMessagesAction: Loading started");
        },
        fulfilled: (state, action) => {
          state.isLoadingInitial = false;
          const remoteMessages = action.payload;

          if (remoteMessages.length === 0) {
            console.log(
              "fetchInitialRemoteMessagesAction: No remote messages received"
            );
            return;
          }

          messagesAdapter.upsertMany(state.msgs, remoteMessages);
          console.log(
            `fetchInitialRemoteMessagesAction: Updated state with ${remoteMessages.length} remote messages`
          );
        },
        rejected: (state, action) => {
          state.isLoadingInitial = false;
          state.error =
            action.error instanceof Error
              ? action.error
              : new Error(String(action.error));
          console.error(
            "fetchInitialRemoteMessagesAction: Failed",
            action.error
          );
        },
      }
    ),

    fetchInitialLocalMessagesAction: create.asyncThunk(
      async (
        options: {
          dialogId: string;
          limit: number;
          db: any;
        },
        thunkApi
      ) => {
        const { dialogId, limit, db } = options;

        try {
          const localMessages = await fetchLocalMessages(db, dialogId, {
            limit,
            throwOnError: false,
          });

          console.log(
            `fetchInitialLocalMessagesAction: Fetched ${localMessages.length} local messages for dialog ${dialogId}`
          );
          return localMessages;
        } catch (error) {
          console.error(
            "fetchInitialLocalMessagesAction: Unexpected error:",
            error
          );
          throw error;
        }
      },
      {
        pending: (state) => {
          state.isLoadingInitial = true;
          state.error = null;
          console.log("fetchInitialLocalMessagesAction: Loading started");
        },
        fulfilled: (state, action) => {
          state.isLoadingInitial = false;
          const localMessages = action.payload as MessageWithKey[];

          if (localMessages.length === 0) {
            console.log(
              "fetchInitialLocalMessagesAction: No local messages received"
            );
            return;
          }

          messagesAdapter.upsertMany(state.msgs, localMessages);
          console.log(
            `fetchInitialLocalMessagesAction: Updated state with ${localMessages.length} local messages`
          );
        },
        rejected: (state, action) => {
          state.isLoadingInitial = false;
          state.error =
            action.error instanceof Error
              ? action.error
              : new Error(String(action.error));
          console.error(
            "fetchInitialLocalMessagesAction: Failed",
            action.error
          );
        },
      }
    ),

    loadOlderMessages: create.asyncThunk(
      async (
        options: {
          dialogId: string;
          beforeKey: string;
          limit?: number;
          db?: any;
        },
        thunkApi
      ) => {
        const {
          dialogId,
          beforeKey,
          limit = OLDER_LOAD_LIMIT,
          db = browserDb,
        } = options;
        const { dispatch } = thunkApi;

        console.log("loadOlderMessages: Fetching older local messages");
        const localResult = await dispatch(
          fetchOlderLocalMessagesAction({ dialogId, beforeKey, limit, db })
        ).unwrap();

        console.log("loadOlderMessages: Fetching older remote messages");
        const remoteResult = await dispatch(
          fetchOlderRemoteMessagesAction({ dialogId, beforeKey, limit })
        ).unwrap();

        return {
          dialogId,
          localCount: localResult.length,
          remoteCount: remoteResult.length,
          totalLimit: limit,
        };
      },
      {
        pending: (state) => {
          state.isLoadingOlder = true;
          state.error = null;
          console.log("loadOlderMessages: Loading older messages started");
        },
        fulfilled: (state, action) => {
          state.isLoadingOlder = false;
          const { localCount, remoteCount, totalLimit } = action.payload;

          if (localCount + remoteCount < totalLimit) {
            state.hasMoreOlder = false;
            console.log("loadOlderMessages: No more older messages to load");
          }

          console.log(
            `loadOlderMessages: Loaded ${localCount} local and ${remoteCount} remote older messages`
          );
        },
        rejected: (state, action) => {
          state.isLoadingOlder = false;
          state.error =
            action.error instanceof Error
              ? action.error
              : new Error(String(action.error));
          console.error(
            "loadOlderMessages: Loading older messages failed",
            action.error
          );
        },
      }
    ),

    fetchOlderLocalMessagesAction: create.asyncThunk(
      async (
        options: {
          dialogId: string;
          beforeKey: string;
          limit: number;
          db: any;
        },
        thunkApi
      ) => {
        const { dialogId, beforeKey, limit, db } = options;

        try {
          const localMessages = await fetchLocalMessages(db, dialogId, {
            limit,
            beforeKey,
            throwOnError: false,
          });

          console.log(
            `fetchOlderLocalMessagesAction: Fetched ${localMessages.length} older local messages for dialog ${dialogId}`
          );
          return localMessages;
        } catch (error) {
          console.error(
            "fetchOlderLocalMessagesAction: Unexpected error:",
            error
          );
          throw error;
        }
      },
      {
        pending: (state) => {
          state.isLoadingOlder = true;
          state.error = null;
          console.log("fetchOlderLocalMessagesAction: Loading started");
        },
        fulfilled: (state, action) => {
          state.isLoadingOlder = false;
          const localMessages = action.payload as MessageWithKey[];

          if (localMessages.length === 0) {
            console.log(
              "fetchOlderLocalMessagesAction: No older local messages received"
            );
            return;
          }

          messagesAdapter.upsertMany(state.msgs, localMessages);
          console.log(
            `fetchOlderLocalMessagesAction: Updated state with ${localMessages.length} older local messages`
          );
        },
        rejected: (state, action) => {
          state.isLoadingOlder = false;
          state.error =
            action.error instanceof Error
              ? action.error
              : new Error(String(action.error));
          console.error("fetchOlderLocalMessagesAction: Failed", action.error);
        },
      }
    ),

    fetchOlderRemoteMessagesAction: create.asyncThunk(
      async (
        options: {
          dialogId: string;
          beforeKey: string;
          limit: number;
        },
        thunkApi
      ) => {
        const { dialogId, beforeKey, limit } = options;
        const state = thunkApi.getState() as NoloRootState;
        const server = selectCurrentServer(state);
        const token = selectCurrentToken(state);

        if (!server || !token) {
          console.warn(
            "fetchOlderRemoteMessagesAction: No server or token available"
          );
          return [];
        }

        try {
          const uniqueServers = Array.from(
            new Set([server, ...FALLBACK_SERVERS])
          ).filter(Boolean) as string[];
          if (uniqueServers.length === 0) return [];

          const remoteResults = await Promise.all(
            uniqueServers.map(async (srv) => {
              return await fetchConvMsgs(srv, token, {
                dialogId,
                limit,
                beforeKey,
              });
            })
          );

          const remoteMessages = remoteResults.flat().filter(isValidMessage);
          console.log(
            `fetchOlderRemoteMessagesAction: Fetched ${remoteMessages.length} older remote messages for dialog ${dialogId}`
          );

          if (remoteMessages.length > 0) {
            await thunkApi.dispatch(upsertMany(remoteMessages));
          }

          return remoteMessages;
        } catch (error) {
          console.error(
            "fetchOlderRemoteMessagesAction: Unexpected error:",
            error
          );
          throw error;
        }
      },
      {
        pending: (state) => {
          state.isLoadingOlder = true;
          state.error = null;
          console.log("fetchOlderRemoteMessagesAction: Loading started");
        },
        fulfilled: (state, action) => {
          state.isLoadingOlder = false;
          const remoteMessages = action.payload;

          if (remoteMessages.length === 0) {
            console.log(
              "fetchOlderRemoteMessagesAction: No older remote messages received"
            );
            return;
          }

          messagesAdapter.upsertMany(state.msgs, remoteMessages);
          console.log(
            `fetchOlderRemoteMessagesAction: Updated state with ${remoteMessages.length} older remote messages`
          );
        },
        rejected: (state, action) => {
          state.isLoadingOlder = false;
          state.error =
            action.error instanceof Error
              ? action.error
              : new Error(String(action.error));
          console.error("fetchOlderRemoteMessagesAction: Failed", action.error);
        },
      }
    ),
  }),
});

export const {
  messageStreamEnd,
  messageStreaming,
  deleteMessage,
  handleSendMessage,
  deleteDialogMsgs,
  addMsg,
  initMsgs,
  resetMsgs,
  fetchInitialRemoteMessagesAction,
  fetchInitialLocalMessagesAction,
  loadOlderMessages,
  fetchOlderLocalMessagesAction,
  fetchOlderRemoteMessagesAction,
} = messageSlice.actions;

export default messageSlice.reducer;

// --- Selectors ---
export const {
  selectAll: selectMsgs,
  selectById: selectMessageById,
  selectIds: selectMessageIds,
} = messagesAdapter.getSelectors((state: NoloRootState) => state.message.msgs);

export const selectFirstStreamProcessed = (state: NoloRootState) =>
  state.message.firstStreamProcessed;

export const selectMessagesState = (state: NoloRootState) => ({
  messages: selectMsgs(state),
  isLoadingInitial: state.message.isLoadingInitial,
  isLoadingOlder: state.message.isLoadingOlder,
  hasMoreOlder: state.message.hasMoreOlder,
  error: state.message.error,
});

/**
 * Selector: 返回消息列表，不进行额外排序。
 */
export const selectMergedMessages = createSelector(
  [selectMsgs],
  (msgs = []) => {
    return msgs; // 直接返回消息列表，不进行额外排序
  }
);
