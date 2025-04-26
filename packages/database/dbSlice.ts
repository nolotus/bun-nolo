import {
  asyncThunkCreator,
  buildCreateSlice,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import type { NoloRootState } from "app/store";

// Import actions
import { removeAction } from "./action/remove";
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
  }),
});

// Export actions including the new upsert action
export const {
  // Async thunk actions are automatically generated but not typically exported here
  // Instead, you dispatch the thunk itself, e.g., dispatch(upsert({ dbKey: '...', data: {...} }))
} = dbSlice.actions;

// Export the async thunk action creators directly for dispatching
export const { remove, patch, read, write, upsert } = dbSlice.actions;

// Export the reducer
export default dbSlice.reducer;
