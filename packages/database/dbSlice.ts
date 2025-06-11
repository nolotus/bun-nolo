import {
  asyncThunkCreator,
  buildCreateSlice,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import type { NoloRootState } from "app/store";

// Import actions
import { removeAction } from "./action/remove";
import { readAction } from "./action/read";
import { readAndWaitAction } from "./action/readAndWait"; // 新增导入
import { writeAction } from "./action/write";
import { patchAction } from "./action/patch";
import { upsertAction } from "./action/upsert";

// Use dbKey as the entity's unique identifier
export const dbAdapter = createEntityAdapter<any>({
  selectId: (entity) => entity.dbKey,
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
    // Async Thunks
    read: create.asyncThunk(readAction, {
      fulfilled: (state, action) => {
        if (action.payload && Object.keys(action.payload).length > 0) {
          dbAdapter.upsertOne(state, action.payload);
        }
      },
    }),
    readAndWait: create.asyncThunk(readAndWaitAction, {
      fulfilled: (state, action) => {
        if (action.payload && Object.keys(action.payload).length > 0) {
          dbAdapter.upsertOne(state, action.payload);
        }
      },
    }),
    remove: create.asyncThunk(removeAction, {
      fulfilled: (state, action) => {
        const { dbKey } = action.payload;
        if (dbKey) dbAdapter.removeOne(state, dbKey);
      },
    }),
    write: create.asyncThunk(writeAction, {
      fulfilled: (state, action) => {
        if (
          action.payload &&
          action.payload.dbKey &&
          Object.keys(action.payload).length > 0
        ) {
          dbAdapter.addOne(state, action.payload);
        }
      },
    }),
    patch: create.asyncThunk(patchAction, {
      fulfilled: (state, action) => {
        const { payload } = action;
        if (payload && payload.dbKey && Object.keys(payload).length > 1) {
          const { dbKey, ...changes } = payload;
          dbAdapter.updateOne(state, { id: dbKey, changes });
        }
      },
    }),
    upsert: create.asyncThunk(upsertAction, {
      fulfilled: (state, action) => {
        if (
          action.payload &&
          action.payload.dbKey &&
          Object.keys(action.payload).length > 0
        ) {
          dbAdapter.upsertOne(state, action.payload);
        }
      },
    }),
  }),
});

// Export actions
export const { remove, read, readAndWait, write, patch, upsert } =
  dbSlice.actions;

// Export the reducer
export default dbSlice.reducer;
