import { NoloRootState } from "app/store";
import { createSelector } from "@reduxjs/toolkit";
import { asyncThunkCreator, buildCreateSlice } from "@reduxjs/toolkit";
import { filter, sort } from "rambda";
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
import { browserDb } from "database/browser/db";

// --- Constants ---
const FALLBACK_SERVERS = ["https://cybot.one", "https://cybot.run"];
const INITIAL_LOAD_LIMIT = 50; // 初始加载数量

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

// --- Utility: compareMessagesByTime ---
export const compareMessagesByTime = (a: Message, b: Message): number => {
  const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
  const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
  if (aTime === bTime) return a.id.localeCompare(b.id);
  return aTime - bTime; // 升序 (oldest first)
};

export interface MessageSliceState {
  msgs: Message[];
  streamMessages: Message[];
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
  msgs: [],
  streamMessages: [],
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
          limit?: number; // 可选的 limit 参数，默认值为 INITIAL_LOAD_LIMIT
          db?: any; // 可选的数据库对象，默认值为 browserDb
        },
        thunkApi
      ) => {
        const {
          dialogId,
          limit = INITIAL_LOAD_LIMIT,
          db = browserDb,
        } = options;
        const { dispatch } = thunkApi;

        // 1. 调用本地消息初始化
        console.log("initMsgs: Fetching initial local messages");
        await dispatch(
          fetchInitialLocalMessagesAction({ dialogId, limit, db })
        ).unwrap();

        // 2. 调用远程消息初始化
        console.log("initMsgs: Fetching initial remote messages");
        await dispatch(
          fetchInitialRemoteMessagesAction({ dialogId, limit })
        ).unwrap();

        // 返回结果，实际数据通过其他 action 更新到状态
        return { dialogId };
      },
      {
        pending: (state) => {
          state.isLoadingInitial = true;
          state.error = null;
          state.msgs = []; // 重置消息列表
          state.streamMessages = []; // 重置流状态
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
        console.log("messageStreamEnd: Adding final message", msg);
        await dispatch(addMsg(msg)).unwrap();
        return { id: msg.id };
      },
      {
        fulfilled: (state, action) => {
          const { id } = action.payload;
          console.log("messageStreamEnd: Cleaning stream message with id", id);
          state.streamMessages = filter(
            (streamMsg) => streamMsg.id !== id,
            state.streamMessages
          );
        },
        rejected: (state, action) => {
          console.error("messageStreamEnd failed:", action.error);
          if (action.meta.arg?.id) {
            state.streamMessages = filter(
              (streamMsg) => streamMsg.id !== action.meta.arg.id,
              state.streamMessages
            );
          }
        },
      }
    ),

    messageStreaming: create.reducer<Message>((state, action) => {
      const message = action.payload;
      const index = state.streamMessages.findIndex(
        (msg) => msg.id === message.id
      );
      if (index !== -1) {
        state.streamMessages[index] = {
          ...state.streamMessages[index],
          ...message,
        };
      } else {
        state.streamMessages.push(message);
        if (!state.firstStreamProcessed) {
          console.log("messageStreaming: First stream processed flag set");
          state.firstStreamProcessed = true;
        }
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
          state.msgs = state.msgs.filter((msg) => msg.dbKey !== dbKeyToRemove);
          state.streamMessages = state.streamMessages.filter(
            (msg) => msg.dbKey !== dbKeyToRemove
          );
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
          const index = state.msgs.findIndex(
            (msg) => msg.dbKey === newMessage.dbKey || msg.id === newMessage.id
          );
          if (index === -1) {
            console.log(
              "addMsg: Adding new message to state.msgs",
              newMessage.id
            );
            state.msgs.push(newMessage);
          } else {
            console.log(
              "addMsg: Updating existing message in state.msgs",
              newMessage.id
            );
            state.msgs[index] = { ...state.msgs[index], ...newMessage };
          }
        },
        rejected: (state, action) => {
          console.error("addMsg failed:", action.error);
        },
      }
    ),

    resetMsgs: create.reducer((state) => {
      console.log("resetMsgs: Clearing all messages and stream state");
      state.msgs = [];
      state.streamMessages = [];
      state.firstStreamProcessed = false;
    }),

    // 初次加载远程消息的 action
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
              try {
                const response = await fetch(`${srv}/rpc/getConvMsgs`, {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    dialogId,
                    limit,
                  }),
                });
                if (!response.ok) {
                  console.error(
                    `fetchInitialRemoteMessagesAction: Failed ${response.status} from ${srv}`
                  );
                  return [];
                }
                const data = await response.json();
                return Array.isArray(data) ? data.filter(isValidMessage) : [];
              } catch (error) {
                console.error(
                  `fetchInitialRemoteMessagesAction: Error fetching from ${srv}:`,
                  error
                );
                return [];
              }
            })
          );

          const remoteMessages = remoteResults.flat();
          console.log(
            `fetchInitialRemoteMessagesAction: Fetched ${remoteMessages.length} remote messages for dialog ${dialogId}`
          );

          // 将远程消息持久化到数据库
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

          // 将远程消息更新到状态中，直接合并到 msgs
          const messageMap = new Map<string, Message>();
          state.msgs.forEach((msg) => {
            if (msg.id) messageMap.set(msg.id, msg);
          });
          remoteMessages.forEach((remoteMsg) => {
            const existing = messageMap.get(remoteMsg.id);
            messageMap.set(remoteMsg.id, { ...(existing || {}), ...remoteMsg });
          });
          state.msgs = sort(
            compareMessagesByTime,
            Array.from(messageMap.values())
          );

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

    // 初次加载本地消息的 action
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
          // 从本地数据库获取消息
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

          // 将本地消息更新到状态中，直接合并到 msgs
          const messageMap = new Map<string, Message>();
          state.msgs.forEach((msg) => {
            if (msg.id) messageMap.set(msg.id, msg);
          });
          localMessages.forEach((localMsg) => {
            const existing = messageMap.get(localMsg.id);
            messageMap.set(localMsg.id, { ...(existing || {}), ...localMsg });
          });
          state.msgs = sort(
            compareMessagesByTime,
            Array.from(messageMap.values())
          );

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
} = messageSlice.actions;

export default messageSlice.reducer;

// --- Selectors ---
export const selectMsgs = (state: NoloRootState) => state.message.msgs;
export const selectStreamMessages = (state: NoloRootState) =>
  state.message.streamMessages;
export const selectFirstStreamProcessed = (state: NoloRootState) =>
  state.message.firstStreamProcessed;
export const selectMessagesState = (state: NoloRootState) => ({
  messages: state.message.msgs,
  isLoadingInitial: state.message.isLoadingInitial,
  isLoadingOlder: state.message.isLoadingOlder,
  hasMoreOlder: state.message.hasMoreOlder,
  error: state.message.error,
});

/**
 * Selector: 合并持久化消息 (msgs) 和流式消息 (streamMessages)。
 * 使用 Map 确保流式消息更新能覆盖旧消息，并按时间排序。
 */
export const selectMergedMessages = createSelector(
  [selectMsgs, selectStreamMessages],
  (msgs = [], streamMessages = []) => {
    const messageMap = new Map<string, Message>();
    msgs.forEach((msg) => msg?.id && messageMap.set(msg.id, msg));
    streamMessages.forEach((streamMsg) => {
      if (streamMsg?.id) {
        const existing = messageMap.get(streamMsg.id);
        messageMap.set(
          streamMsg.id,
          existing ? { ...existing, ...streamMsg } : streamMsg
        );
      }
    });
    return sort(compareMessagesByTime, Array.from(messageMap.values()));
  }
);
