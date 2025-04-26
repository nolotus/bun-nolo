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
//web
import { browserDb } from "database/browser/db";

// --- Constants ---
const FALLBACK_SERVERS = ["https://cybot.one", "https://cybot.run"];
const INITIAL_LOAD_LIMIT = 50;
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
  sortComparer: (a, b) => a.id.localeCompare(b.id),
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
    }),

    // --- Async Thunks ---
    initMsgs: create.asyncThunk(
      async (
        {
          dialogId,
          limit = INITIAL_LOAD_LIMIT,
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
        return { dialogId };
      },
      {
        pending: (state) => {
          state.isLoadingInitial = true;
          state.error = null;
          messagesAdapter.removeAll(state.msgs);
          state.firstStreamProcessed = false;
        },
        fulfilled: (state) => {
          state.isLoadingInitial = false;
        },
        rejected: createRejectedHandler("isLoadingInitial"),
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
          const existingMessage = state.msgs.entities[action.payload.id];
          if (existingMessage?.controller) {
            messagesAdapter.updateOne(state.msgs, {
              id: action.payload.id,
              changes: { controller: undefined },
            });
          }
        },
        rejected: (state, action) => {
          console.error("messageStreamEnd failed:", action.error);
        },
      }
    ),

    deleteMessage: create.asyncThunk(
      async (dbKey: string, { dispatch }) => {
        await dispatch(remove(dbKey));
        return { dbKey };
      },
      {
        fulfilled: (state, action) => {
          const msgToRemove = Object.values(state.msgs.entities).find(
            (msg) => msg?.dbKey === action.payload.dbKey
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

    addMsg: create.asyncThunk(
      async (msg: Message, { dispatch }) => {
        await dispatch(
          write({
            data: { ...msg, type: DataType.MSG },
            customKey: msg.dbKey,
          })
        );
        return msg;
      },
      {
        fulfilled: (state, action) => {
          messagesAdapter.upsertOne(state.msgs, action.payload);
        },
        rejected: (state, action) => {
          console.error("addMsg failed:", action.error);
        },
      }
    ),

    handleSendMessage: create.asyncThunk(sendMessageAction),
    deleteDialogMsgs: create.asyncThunk(deleteDialogMsgsAction),

    // --- Fetching Thunks (Initial Load - Still separate for potential clarity) ---
    fetchInitialRemoteMessagesAction: create.asyncThunk(
      async (
        { dialogId, limit }: { dialogId: string; limit: number },
        { getState, dispatch }
      ) => {
        const state = getState() as NoloRootState;
        const server = selectCurrentServer(state);
        const token = selectCurrentToken(state);
        if (!server || !token) return { messages: [] }; // Return structure expected by handler

        const uniqueServers = Array.from(
          new Set([server, ...FALLBACK_SERVERS])
        ).filter(Boolean) as string[];
        if (uniqueServers.length === 0) return { messages: [] };

        try {
          const results = await Promise.all(
            uniqueServers.map((srv) =>
              fetchConvMsgs(srv, token, { dialogId, limit })
            )
          );
          const remoteMessages = results.flat().filter(isValidMessage);
          // Note: upsertMany is handled by fulfilled handler
          return { messages: remoteMessages };
        } catch (error) {
          console.error("fetchInitialRemoteMessagesAction Error:", error);
          throw error;
        }
      },
      {
        pending: createPendingHandler("isLoadingInitial"),
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
            throwOnError: false,
          });
          return { messages: localMessages }; // Return structure expected by handler
        } catch (error) {
          console.error("fetchInitialLocalMessagesAction Error:", error);
          throw error;
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
          beforeKey,
          limit = OLDER_LOAD_LIMIT,
          db = browserDb,
        }: {
          dialogId: string;
          beforeKey: string;
          limit?: number;
          db?: any;
        },
        { getState } // Removed dispatch as we are not dispatching sub-actions
      ) => {
        const state = getState() as NoloRootState;
        const server = selectCurrentServer(state);
        const token = selectCurrentToken(state);

        // --- Fetch Local Older Messages ---
        const fetchLocalPromise = fetchLocalMessages(db, dialogId, {
          limit,
          beforeKey,
          throwOnError: false, // Or handle error inside if needed
        }).catch((error) => {
          console.error(
            "loadOlderMessages: Failed to fetch local older messages",
            error
          );
          return []; // Return empty array on error to allow remote fetch to proceed
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
                fetchConvMsgs(srv, token, { dialogId, limit, beforeKey })
              )
            );
            // Filter valid messages *after* fetching
            return results.flat().filter(isValidMessage);
          } catch (error) {
            console.error(
              "loadOlderMessages: Failed to fetch remote older messages",
              error
            );
            // Don't rethrow here if we want Promise.all below to resolve
            return []; // Return empty array on error
          }
        })(); // Immediately invoke the async function

        // --- Wait for both fetches ---
        // Promise.all ensures both fetches complete (or fail gracefully if handled above)
        const [localMessages, remoteMessages] = await Promise.all([
          fetchLocalPromise,
          fetchRemotePromise,
        ]);

        // --- Return combined results for the fulfilled handler ---
        return {
          messages: [...localMessages, ...remoteMessages] as Message[], // Combine results
          limit, // Pass limit for hasMoreOlder calculation
        };
      },
      {
        pending: createPendingHandler("isLoadingOlder"),
        fulfilled: (state, action) => {
          state.isLoadingOlder = false;
          const { messages, limit } = action.payload;

          if (messages.length > 0) {
            messagesAdapter.upsertMany(state.msgs, messages);
            console.log(
              `loadOlderMessages: Added ${messages.length} older messages.`
            );
          } else {
            console.log("loadOlderMessages: No older messages found.");
          }

          // Update hasMoreOlder based on whether fewer messages were fetched than requested
          if (messages.length < limit) {
            state.hasMoreOlder = false;
            console.log("loadOlderMessages: No more older messages expected.");
          }
        },
        rejected: createRejectedHandler("isLoadingOlder"), // Generic handler is fine
      }
    ),

    // REMOVED: fetchOlderLocalMessagesAction
    // REMOVED: fetchOlderRemoteMessagesAction
  }),
});

// --- Actions ---
export const {
  messageStreamEnd,
  messageStreaming,
  deleteMessage,
  handleSendMessage,
  deleteDialogMsgs,
  addMsg,
  initMsgs,
  resetMsgs,
  // Keep initial fetch actions if initMsgs still dispatches them
  fetchInitialRemoteMessagesAction,
  fetchInitialLocalMessagesAction,
  loadOlderMessages, // Export the merged thunk
  // Removed exports for the merged actions
} = messageSlice.actions;

// --- Reducer ---
export default messageSlice.reducer;

// --- Selectors ---
export const {
  selectAll: selectMsgs,
  selectById: selectMessageById,
  selectIds: selectMessageIds,
} = messagesAdapter.getSelectors((state: NoloRootState) => state.message.msgs);

export const selectFirstStreamProcessed = (state: NoloRootState) =>
  state.message.firstStreamProcessed;
export const selectIsLoadingInitial = (state: NoloRootState) =>
  state.message.isLoadingInitial;
export const selectIsLoadingOlder = (state: NoloRootState) =>
  state.message.isLoadingOlder;
export const selectHasMoreOlder = (state: NoloRootState) =>
  state.message.hasMoreOlder;
export const selectMessageError = (state: NoloRootState) => state.message.error;

export const selectMergedMessages = createSelector(
  [selectMsgs],
  (msgs) => msgs
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
