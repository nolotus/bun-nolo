import { NoloRootState } from "app/store";
import { noloQueryRequest } from "database/client/queryRequest";
import {
  PayloadAction,
  buildCreateSlice,
  asyncThunkCreator,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import { noloReadRequest } from "./client/readRequest";
// Entity adapter
export const dbAdapter = createEntityAdapter();
export const { selectById, selectEntities, selectAll, selectIds, selectTotal } =
  dbAdapter.getSelectors((state: NoloRootState) => state.db);
export const makeSelectEntityById =
  (entityId: string) => (state: NoloRootState) =>
    selectById(state, entityId);

// Initial state
const initialState = dbAdapter.getInitialState({});
const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

function mergeSource(existingItem, newSource) {
  if (existingItem) {
    const sourceSet = new Set(existingItem.source);
    sourceSet.add(newSource);
    return Array.from(sourceSet);
  } else {
    return [newSource];
  }
}

// Slice
const dbSlice = createSliceWithThunks({
  name: "db",
  initialState,

  reducers: (create) => ({
    query: create.asyncThunk(
      async (queryConfig, thunkApi) => {
        const state = thunkApi.getState();
        const res = await noloQueryRequest(state, queryConfig);
        const result = await res.json();
        return result;
      },
      {
        fulfilled: (state, action) => {
          dbAdapter.upsertMany(state, action.payload);
        },
      },
    ),
    read: create.asyncThunk(
      async (id, thunkApi) => {
        const state = thunkApi.getState();
        const res = await noloReadRequest(state, id);
        const result = await res.json();
        return result;
      },
      {
        fulfilled: (state, action) => {
          dbAdapter.upsertOne(state, action.payload);
        },
      },
    ),
    updateData: create.reducer((state, action) => {
      const updatedData = action.payload.data.map((item) => {
        const existingItem = state.entities[item.id];
        return {
          ...item,
          source: mergeSource(existingItem, action.payload.source),
        };
      });
      dbAdapter.upsertMany(state, updatedData);
    }),

    deleteData: create.reducer((state, action) => {
      dbAdapter.removeOne(state, action.payload);
    }),
    upsertOne: create.reducer((state, action) => {
      dbAdapter.upsertOne(state, action.payload);
    }),
    upsertMany: create.reducer((state, action) => {
      dbAdapter.upsertMany(state, action.payload);
    }),

    removeOne: create.reducer((state, action) => {
      dbAdapter.removeOne(state, action.payload);
    }),
    updateOne: create.reducer((state, action) => {
      dbAdapter.updateOne(state, {
        id: action.payload.id,
        changes: action.payload.changes,
      });
    }),
  }),
});

export const {
  updateData,
  deleteData,
  upsertOne,
  upsertMany,
  removeOne,
  updateOne,
  query,
  read,
} = dbSlice.actions;
export default dbSlice.reducer;
