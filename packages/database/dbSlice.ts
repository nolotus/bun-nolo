import {
  asyncThunkCreator,
  buildCreateSlice,
  createEntityAdapter,
  PayloadAction, // Import PayloadAction if needed for simple reducers like upsertMany
} from "@reduxjs/toolkit";
import type { NoloRootState } from "app/store";

// Import actions
import { removeAction } from "./action/remove";
import { queryServerAction } from "./action/queryServer";
import { readAction } from "./action/read";
import { writeAction } from "./action/write";
import { patchAction } from "./action/patch";
import { upsertAction } from "./action/upsert"; // Import the new upsert action

// Use dbKey as the entity's unique identifier
export const dbAdapter = createEntityAdapter<any>({
  // Add type <any> or specific type if known
  selectId: (entity) => entity.dbKey, // Specify dbKey as ID
  // Optionally add sortComparer if needed
});

// Selectors
export const { selectById, selectEntities, selectAll, selectIds, selectTotal } =
  dbAdapter.getSelectors((state: NoloRootState) => state.db);

// Initial state
const initialState = dbAdapter.getInitialState({});

// Create slice with async thunks
const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

// Slice definition
const dbSlice = createSliceWithThunks({
  name: "db",
  initialState,
  reducers: (create) => ({
    // --- Async Thunks ---
    queryServer: create.asyncThunk(queryServerAction), // Keep existing thunks
    read: create.asyncThunk(readAction, {
      fulfilled: (state, action) => {
        if (action.payload) {
          // Basic check for non-empty object payload
          if (Object.keys(action.payload).length === 0) {
            console.warn("Empty or invalid data detected in read action:", {
              payload: action.payload,
              stack: new Error().stack,
            });
          } else {
            // Use upsertOne to add or update based on dbKey
            dbAdapter.upsertOne(state, action.payload);
          }
        }
        // Handle cases where payload might be null/undefined if needed
      },
    }),
    remove: create.asyncThunk(removeAction, {
      fulfilled: (state, action) => {
        const { dbKey } = action.payload; // Expecting payload like { dbKey: 'some-key' }
        if (dbKey) {
          dbAdapter.removeOne(state, dbKey); // Use dbKey to remove
        } else {
          console.warn("Remove fulfilled without dbKey:", action.payload);
        }
      },
    }),
    write: create.asyncThunk(writeAction, {
      fulfilled: (state, action) => {
        // Check if payload and dbKey exist and payload is not empty
        if (
          !action.payload ||
          !action.payload.dbKey ||
          Object.keys(action.payload).length === 0
        ) {
          console.warn("Empty or invalid data detected in write action:", {
            payload: action.payload,
            stack: new Error().stack,
          });
        } else {
          // Use addOne as write implies creating a new entry
          dbAdapter.addOne(state, action.payload);
        }
      },
    }),
    patch: create.asyncThunk(patchAction, {
      fulfilled: (state, action) => {
        const { payload } = action;
        // Check for dbKey and that there are changes besides dbKey
        if (!payload || !payload.dbKey || Object.keys(payload).length <= 1) {
          console.warn("Empty or invalid data detected in patch action:", {
            payload,
            stack: new Error().stack,
          });
        } else {
          // Extract dbKey and changes for updateOne
          const { dbKey, ...changes } = payload;
          // updateOne requires an object with id and changes properties
          dbAdapter.updateOne(state, { id: dbKey, changes }); // Use dbKey as the ID
        }
      },
    }),
    // --- Add the new Upsert Async Thunk ---
    upsert: create.asyncThunk(upsertAction, {
      fulfilled: (state, action) => {
        // Check if payload and dbKey exist and payload is not empty
        if (
          !action.payload ||
          !action.payload.dbKey ||
          Object.keys(action.payload).length === 0
        ) {
          console.warn("Empty or invalid data detected in upsert action:", {
            payload: action.payload,
            stack: new Error().stack,
          });
        } else {
          // Use upsertOne for both adding new and updating existing entries
          dbAdapter.upsertOne(state, action.payload);
        }
      },
      // Optionally add pending and rejected handlers if needed
      // pending: (state, action) => { ... },
      // rejected: (state, action) => { ... },
    }),

    // --- Simple Reducers (if any) ---
    // Keep upsertMany as a simple reducer if it doesn't involve async logic
    upsertMany: (state, action: PayloadAction<any[]>) => {
      // Use PayloadAction for typing
      if (!Array.isArray(action.payload) || action.payload.length === 0) {
        console.warn("Invalid payload for upsertMany:", action.payload);
        return; // Exit if payload is not a non-empty array
      }
      // Check each item for dbKey and non-empty object
      if (
        action.payload.some(
          (item) => !item || !item.dbKey || Object.keys(item).length === 0
        )
      ) {
        console.warn("Empty or invalid item detected in upsertMany:", {
          payload: action.payload,
          stack: new Error().stack,
        });
        // Optionally filter out invalid items before upserting
        // const validItems = action.payload.filter(item => item && item.dbKey && Object.keys(item).length > 0);
        // dbAdapter.upsertMany(state, validItems);
        // For now, proceed with original behavior (potential issues if items are invalid)
      }
      dbAdapter.upsertMany(state, action.payload);
    },
  }),
});

// Export actions including the new upsert action
export const {
  upsertMany, // Keep if needed as simple reducer
  // Async thunk actions are automatically generated but not typically exported here
  // Instead, you dispatch the thunk itself, e.g., dispatch(upsert({ dbKey: '...', data: {...} }))
} = dbSlice.actions;

// Export the async thunk action creators directly for dispatching
export const { remove, patch, read, write, queryServer, upsert } =
  dbSlice.actions;

// Export the reducer
export default dbSlice.reducer;
