import { NoloRootState } from "app/store";
import {
  createSelector,
  asyncThunkCreator,
  buildCreateSlice,
  createEntityAdapter,
  EntityState,
  Update,
} from "@reduxjs/toolkit";
import { DataType } from "create/types";
import { remove, write } from "database/dbSlice";
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
//web
import { browserDb } from "database/browser/db";

// --- Constants ---
const FALLBACK_SERVERS = ["https://cybot.one", "https://cybot.run"];
const OLDER_LOAD_LIMIT = 30;

// --- Utility: isValidMessage ---
const isValidMessage = (msg: any): msg is Message =>
  msg &&
  typeof msg === "object" &&
  typeof msg.id === "string" &&
  msg.content != null &&
  msg.createdAt != null;

// --- Entity Adapter ---
const messagesAdapter = createEntityAdapter<Message>({
  selectId: (message) => message.id,
  sortComparer: (a, b) => a.id.localeCompare(b.id), // 保持原来的排序比较器
});

// --- State Interface ---
export interface MessageSliceState {
  msgs: EntityState<Message>;
  firstStreamProcessed: boolean;
  isLoadingInitial: boolean;
  isLoadingOlder: boolean;
  hasMoreOlder: boolean;
  error: Error | null;
}

// --- Slice Creation Setup ---
const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

// --- Initial State ---
const initialState: MessageSliceState = {
  msgs: messagesAdapter.getInitialState(),
  firstStreamProcessed: false,
  isLoadingInitial: false,
  isLoadingOlder: false,
  hasMoreOlder: true,
  error: null,
};

// --- Helper Functions for Async Thunk Handlers ---
// Generic pending handler
const createPendingHandler =
  (loadingKey: "isLoadingInitial" | "isLoadingOlder") =>
  (state: MessageSliceState) => {
    state[loadingKey] = true;
    state.error = null;
  };

// Generic rejected handler
const createRejectedHandler =
  (loadingKey: "isLoadingInitial" | "isLoadingOlder") =>
  (state: MessageSliceState, action: any) => {
    state[loadingKey] = false;
    state.error =
      action.error instanceof Error
        ? action.error
        : new Error(String(action.error));
    console.error(
      `${action.type} failed:`, // Keep minimal error logging
      action.error
    );
  };

// Generic fulfilled handler for fetch actions that upsert messages
// Modified: Now takes a payload containing messages instead of directly being the message array
const createFetchFulfilledHandler =
  (loadingKey: "isLoadingInitial" | "isLoadingOlder") =>
  (state: MessageSliceState, action: { payload: { messages: Message[] } }) => {
    state[loadingKey] = false;
    if (action.payload?.messages?.length > 0) {
      // 使用 upsertMany，它会根据 id 更新或插入，天然处理了与 store 中现有数据的“去重”
      messagesAdapter.upsertMany(state.msgs, action.payload.messages);
    }
  };

// --- Message Slice ---
export const messageSlice = createSliceWithThunks({
  name: "message",
  initialState: initialState as MessageSliceState,
  reducers: (create) => ({
    // --- Simple Reducers ---
    messageStreaming: create.reducer<Message>((state, action) => {
      messagesAdapter.upsertOne(state.msgs, action.payload);
      state.firstStreamProcessed = true;
    }),
    resetMsgs: create.reducer((state) => {
      messagesAdapter.removeAll(state.msgs);
      state.firstStreamProcessed = false;
      // 重置时也应重置 hasMoreOlder 状态
      state.hasMoreOlder = true;
      state.error = null;
      state.isLoadingInitial = false;
      state.isLoadingOlder = false;
    }),

    // --- Async Thunks ---
    initMsgs: create.asyncThunk(
      async (
        {
          dialogId,
          limit,
          db = browserDb,
        }: {
          dialogId: string;
          limit?: number;
          db?: any;
        },
        { dispatch }
      ) => {
        // Keep parallel fetching for initial load
        await Promise.all([
          dispatch(fetchInitialLocalMessagesAction({ dialogId, limit, db })),
          dispatch(fetchInitialRemoteMessagesAction({ dialogId, limit })),
        ]);
        return { dialogId }; // 返回dialogId或其他需要的信息
      },
      {
        pending: (state) => {
          // 重置状态应该是 initMsgs 的职责
          messagesAdapter.removeAll(state.msgs);
          state.firstStreamProcessed = false;
          state.isLoadingInitial = true;
          state.isLoadingOlder = false; // 初始化时不应该加载更旧的
          state.hasMoreOlder = true; // 重置 hasMoreOlder
          state.error = null;
        },
        fulfilled: (state, action) => {
          // pending 中已经设置 isLoadingInitial = true，这里需要设置为 false
          // 注意：子 thunk 的 fulfilled handler 也会设置 isLoadingInitial = false，
          // 但在这里设置可以确保即使子 thunk 没有返回任何消息，状态也能正确更新。
          state.isLoadingInitial = false;
          // 可以在这里做一些基于dialogId的额外操作，如果需要的话
          console.log(
            `initMsgs fulfilled for dialog: ${action.payload.dialogId}`
          );
        },
        // initMsgs 的 rejected 状态也应该处理
        rejected: (state, action) => {
          state.isLoadingInitial = false; // 确保失败时也停止加载状态
          state.error =
            action.error instanceof Error
              ? action.error
              : new Error(
                  String(action.error) || "Failed to initialize messages"
                );
          console.error("initMsgs failed:", action.error);
        },
      }
    ),

    messageStreamEnd: create.asyncThunk(
      async (msg: Message, { dispatch }) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { controller, ...messageToWrite } = msg; // 移除 controller
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
          // 查找对应的消息
          const existingMessage = state.msgs.entities[action.payload.id];
          if (existingMessage) {
            // 创建一个不包含 controller 的新对象
            const { controller, ...updatedMessage } = existingMessage;
            // 直接使用 setOne 替换整个对象，不检查 controller 是否存在
            messagesAdapter.setOne(state.msgs, updatedMessage);
          }
        },
        rejected: (state, action) => {
          console.error("messageStreamEnd failed:", action.error);
          // 可以考虑如何处理错误，比如重试逻辑或 UI 反馈
        },
      }
    ),
    deleteMessage: create.asyncThunk(
      async (dbKey: string, { dispatch, getState }) => {
        // 找到对应的 message id (如果需要的话，虽然 removeOne 可以直接用 id)
        const state = getState() as NoloRootState;
        const msgToRemove = Object.values(state.message.msgs.entities).find(
          (msg) => msg?.dbKey === dbKey
        );
        await dispatch(remove(dbKey));
        // 返回 id 以便在 fulfilled 中使用
        return { dbKey, id: msgToRemove?.id };
      },
      {
        fulfilled: (state, action) => {
          if (action.payload.id) {
            messagesAdapter.removeOne(state.msgs, action.payload.id);
          } else {
            // 如果基于 dbKey 在 state 中找不到对应的消息 (可能已经被移除或从未添加)
            console.warn(
              `Message with dbKey ${action.payload.dbKey} not found in state during deleteMessage fulfillment.`
            );
          }
        },
        rejected: (state, action) => {
          console.error("deleteMessage failed:", action.error);
          // Consider error state update or feedback
        },
      }
    ),

    addMsg: create.asyncThunk(
      async (msg: Message, { dispatch }) => {
        // 确保写入数据库的数据不包含 controller
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { controller, ...messageToWrite } = msg;
        await dispatch(
          write({
            // 使用过滤后的 messageToWrite
            data: { ...messageToWrite, type: DataType.MSG },
            customKey: msg.dbKey,
          })
        );
        // 返回原始的 msg (包含 controller，如果前端需要) 给 reducer
        return msg;
      },
      {
        fulfilled: (state, action) => {
          // upsertOne 会添加或更新，确保状态一致性
          messagesAdapter.upsertOne(state.msgs, action.payload);
        },
        rejected: (state, action) => {
          console.error("addMsg failed:", action.error);
          // Consider error state update or feedback
        },
      }
    ),

    handleSendMessage: create.asyncThunk(sendMessageAction),
    deleteDialogMsgs: create.asyncThunk(deleteDialogMsgsAction),

    // --- Fetching Thunks (Initial Load - Still separate for potential clarity) ---
    fetchInitialRemoteMessagesAction: create.asyncThunk(
      async (
        { dialogId, limit }: { dialogId: string; limit: number },
        { getState } // 不需要 dispatch 了，因为 fulfilled handler 会处理 upsert
      ): Promise<{ messages: Message[] }> => {
        // 明确返回类型
        const state = getState() as NoloRootState;
        const server = selectCurrentServer(state);
        const token = selectCurrentToken(state);

        // 如果没有服务器或 token，直接返回空数组
        if (!server || !token) {
          console.warn(
            "fetchInitialRemoteMessagesAction: No server or token provided."
          );
          return { messages: [] }; // Return structure expected by handler
        }

        // 确定要请求的服务器列表，包含主服务器和备用服务器，并去重
        const uniqueServers = Array.from(
          new Set([server, ...FALLBACK_SERVERS])
        ).filter(Boolean) as string[]; // filter(Boolean) 移除可能存在的 null 或 undefined

        // 如果没有有效的服务器地址，也返回空数组
        if (uniqueServers.length === 0) {
          console.warn(
            "fetchInitialRemoteMessagesAction: No valid servers found."
          );
          return { messages: [] };
        }

        try {
          // 并行请求所有服务器
          const results = await Promise.all(
            uniqueServers.map((srv) =>
              // 为每个请求添加错误处理，防止 Promise.all 因单个失败而完全拒绝
              fetchConvMsgs(srv, token, { dialogId, limit }).catch((error) => {
                console.error(
                  `fetchInitialRemoteMessagesAction: Failed to fetch from ${srv}`,
                  error
                );
                return []; // 返回空数组以继续 Promise.all
              })
            )
          );

          // 将所有结果合并到一个数组中
          const allRemoteMessages = results.flat();

          // 过滤掉无效的消息（如果 fetchConvMsgs 返回的不是 Message 类型或格式不对）
          const validMessages = allRemoteMessages.filter(isValidMessage);

          // --- 去重逻辑 ---
          // 使用 Map 来存储消息，以消息 ID 为键，确保唯一性
          // 如果有重复 ID，后面的会覆盖前面的，这通常是期望的行为（如果服务器返回不同版本）
          // 或者，如果你想保留第一个遇到的，可以在 set 之前检查 map.has(message.id)
          const uniqueMessagesMap = new Map<string, Message>();
          for (const message of validMessages) {
            uniqueMessagesMap.set(message.id, message);
          }

          // 从 Map 中提取去重后的消息数组
          const uniqueRemoteMessages = Array.from(uniqueMessagesMap.values());

          console.log(
            `fetchInitialRemoteMessagesAction: Fetched ${validMessages.length} messages, returning ${uniqueRemoteMessages.length} unique messages.`
          );

          // 返回包含去重后消息的结构
          return { messages: uniqueRemoteMessages };
        } catch (error) {
          // 虽然内部 Promise.all 的 catch 会处理单个请求的错误，
          // 但保留外层 catch 以防 Promise.all 本身或其他逻辑出错
          console.error("fetchInitialRemoteMessagesAction Error:", error);
          // 抛出错误，让 rejected handler 处理
          throw error; // 确保 thunk 状态变为 rejected
        }
      },
      {
        // pending 和 rejected handler 不变，因为它们只管理加载状态和错误
        pending: createPendingHandler("isLoadingInitial"),
        // fulfilled handler 现在接收 { messages: uniqueRemoteMessages }
        fulfilled: createFetchFulfilledHandler("isLoadingInitial"),
        rejected: createRejectedHandler("isLoadingInitial"),
      }
    ),

    fetchInitialLocalMessagesAction: create.asyncThunk(
      async ({
        dialogId,
        limit,
        db,
      }: {
        dialogId: string;
        limit: number;
        db: any;
      }) => {
        try {
          const localMessages = await fetchLocalMessages(db, dialogId, {
            limit,
            throwOnError: false, // 保持不抛错，返回空数组
          });
          // 确保返回结构一致
          return { messages: localMessages.filter(isValidMessage) }; // 也过滤一下本地消息
        } catch (error) {
          console.error("fetchInitialLocalMessagesAction Error:", error);
          // 即使 fetchLocalMessages 设置了 throwOnError: false, 也可能发生其他错误
          // 返回空数组结构，让 fulfilled handler 处理
          return { messages: [] };
          // 或者选择抛出错误，让 rejected handler 处理
          // throw error;
        }
      },
      {
        pending: createPendingHandler("isLoadingInitial"),
        fulfilled: createFetchFulfilledHandler("isLoadingInitial"),
        rejected: createRejectedHandler("isLoadingInitial"),
      }
    ),

    // --- loadOlderMessages (Merged Logic) ---
    loadOlderMessages: create.asyncThunk(
      async (
        {
          dialogId,
          beforeKey, // 使用 beforeKey 来确定加载点
          limit = OLDER_LOAD_LIMIT,
          db = browserDb,
        }: {
          dialogId: string;
          beforeKey: string; // beforeKey 是必须的，用来分页
          limit?: number;
          db?: any;
        },
        { getState } // 不需要 dispatch
      ): Promise<{ messages: Message[]; limit: number }> => {
        // 明确返回类型
        const state = getState() as NoloRootState;
        const server = selectCurrentServer(state);
        const token = selectCurrentToken(state);

        // --- Fetch Local Older Messages ---
        const fetchLocalPromise = fetchLocalMessages(db, dialogId, {
          limit,
          beforeKey,
          throwOnError: false, // 内部处理错误，返回空数组
        }).catch((error) => {
          console.error(
            "loadOlderMessages: Failed to fetch local older messages",
            error
          );
          return []; // 返回空数组
        });

        // --- Fetch Remote Older Messages ---
        const fetchRemotePromise = (async () => {
          if (!server || !token) {
            console.warn(
              "loadOlderMessages: No server or token for remote fetch."
            );
            return [];
          }
          const uniqueServers = Array.from(
            new Set([server, ...FALLBACK_SERVERS])
          ).filter(Boolean) as string[];
          if (uniqueServers.length === 0) return [];

          try {
            const results = await Promise.all(
              uniqueServers.map((srv) =>
                // 添加内部错误处理
                fetchConvMsgs(srv, token, { dialogId, limit, beforeKey }).catch(
                  (error) => {
                    console.error(
                      `loadOlderMessages: Failed to fetch older messages from ${srv}`,
                      error
                    );
                    return [];
                  }
                )
              )
            );
            // 合并、过滤无效消息
            return results.flat().filter(isValidMessage);
          } catch (error) {
            // 这个 catch 可能在 Promise.all 本身出错时触发
            console.error(
              "loadOlderMessages: Failed to fetch remote older messages (outer catch)",
              error
            );
            return []; // 返回空数组
          }
        })(); // 立即调用 async IIFE

        // --- Wait for both fetches ---
        const [localMessages, remoteMessages] = await Promise.all([
          fetchLocalPromise,
          fetchRemotePromise,
        ]);

        // --- Combine and Deduplicate ---
        const allMessages = [...localMessages, ...remoteMessages];
        const uniqueMessagesMap = new Map<string, Message>();
        for (const message of allMessages) {
          // 同样使用 Map 进行去重
          uniqueMessagesMap.set(message.id, message);
        }
        const uniqueMessages = Array.from(uniqueMessagesMap.values());

        console.log(
          `loadOlderMessages: Fetched ${localMessages.length} local, ${remoteMessages.length} remote. Returning ${uniqueMessages.length} unique older messages.`
        );

        // --- Return combined results for the fulfilled handler ---
        return {
          messages: uniqueMessages, // 返回去重后的消息
          limit, // 传递 limit 用于 hasMoreOlder 计算
        };
      },
      {
        pending: createPendingHandler("isLoadingOlder"),
        fulfilled: (state, action) => {
          state.isLoadingOlder = false;
          const { messages, limit } = action.payload;

          if (messages.length > 0) {
            // upsertMany 会处理与 store 中现有数据的合并/更新
            messagesAdapter.upsertMany(state.msgs, messages);
            console.log(
              `loadOlderMessages: Added/Updated ${messages.length} older messages.`
            );
          } else {
            console.log("loadOlderMessages: No new older messages found.");
          }

          // 更新 hasMoreOlder 状态
          // 如果返回的消息数量小于请求的数量，说明可能没有更多旧消息了
          if (messages.length < limit) {
            state.hasMoreOlder = false;
            console.log(
              "loadOlderMessages: Reached the end, no more older messages expected."
            );
          } else {
            // 如果返回的数量等于请求的数量，我们假设（或希望）还有更多
            // 注意：这只是一个假设，可能刚好返回了 limit 数量的消息就没了
            // 更可靠的方法是 API 能明确告知是否还有更多数据
            state.hasMoreOlder = true;
          }
        },
        // rejected handler 处理整个 thunk 的失败
        rejected: (state, action) => {
          state.isLoadingOlder = false; // 停止加载状态
          state.error =
            action.error instanceof Error
              ? action.error
              : new Error(
                  String(action.error) || "Failed to load older messages"
                );
          console.error("loadOlderMessages failed:", action.error);
          // 考虑是否需要重置 hasMoreOlder 或进行其他错误处理
        },
      }
    ),
  }),
  // 选择器部分保持不变
  selectors: {
    selectMsgsState: (state) => state.msgs, // Select the raw entity state if needed
    selectFirstStreamProcessed: (state) => state.firstStreamProcessed,
    selectIsLoadingInitial: (state) => state.isLoadingInitial,
    selectIsLoadingOlder: (state) => state.isLoadingOlder,
    selectHasMoreOlder: (state) => state.hasMoreOlder,
    selectMessageError: (state) => state.error,
  },
});

// --- Selectors using the adapter ---
// 直接从导出的 slice 中获取 selectors
const baseSelectors = messagesAdapter.getSelectors<NoloRootState>(
  (state) => state.message.msgs // 指向正确的 state slice
);

// --- Re-export adapter selectors ---
export const selectAllMsgs = baseSelectors.selectAll;
export const selectMsgById = baseSelectors.selectById;
export const selectMsgIds = baseSelectors.selectIds;
export const selectMsgEntities = baseSelectors.selectEntities;
export const selectTotalMsgs = baseSelectors.selectTotal;

// --- Export other selectors from the slice ---
export const {
  selectFirstStreamProcessed,
  selectIsLoadingInitial,
  selectIsLoadingOlder,
  selectHasMoreOlder,
  selectMessageError,
} = messageSlice.selectors;

// --- Combined/Memoized Selectors ---
// selectMergedMessages 似乎只是 selectAllMsgs 的别名，如果不需要额外逻辑可以移除
// export const selectMergedMessages = selectAllMsgs;
// 如果确实需要一个不同的名字或者未来可能有合并逻辑：
export const selectMergedMessages = createSelector(
  [selectAllMsgs], // 依赖于 adapter selector
  (msgs) => msgs // 直接返回
);

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

// --- Actions ---
// 导出所有 action creators
export const {
  messageStreaming,
  resetMsgs,
  initMsgs,
  messageStreamEnd,
  deleteMessage,
  addMsg,
  handleSendMessage,
  deleteDialogMsgs,
  fetchInitialRemoteMessagesAction, // 保持导出以供 initMsgs 调用
  fetchInitialLocalMessagesAction, // 保持导出以供 initMsgs 调用
  loadOlderMessages,
} = messageSlice.actions;

// --- Reducer ---
export default messageSlice.reducer;
