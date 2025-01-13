import {
  asyncThunkCreator,
  buildCreateSlice,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import type { NoloRootState } from "app/store";

import { deleteAction } from "./action/delete";
import { queryServerAction } from "./action/queryServer";
import { readAction } from "./action/read";
import { writeAction } from "./action/write";
import { patchAction } from "./action/patch";
export const dbAdapter = createEntityAdapter();

export const { selectById, selectEntities, selectAll, selectIds, selectTotal } =
  dbAdapter.getSelectors((state: NoloRootState) => state.db);

export const makeSelectEntityById =
  (entityId: string) => (state: NoloRootState) =>
    selectById(state, entityId);

const initialState = dbAdapter.getInitialState({});

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

// Slice
const dbSlice = createSliceWithThunks({
  name: "db",
  initialState,
  reducers: (create) => ({
    queryServer: create.asyncThunk(queryServerAction),
    read: create.asyncThunk(readAction, {
      fulfilled: (state, action) => {
        if (action.payload) {
          dbAdapter.upsertOne(state, action.payload);
        }
      },
    }),
    deleteData: create.asyncThunk(deleteAction, {
      fulfilled: (state, action) => {
        const { id } = action.payload;
        dbAdapter.removeOne(state, id);
      },
    }),
    write: create.asyncThunk(writeAction, {
      fulfilled: (state, action) => {
        dbAdapter.addOne(state, action.payload);
      },
    }),
    upsertMany: dbAdapter.upsertMany,
    patchData: create.asyncThunk(patchAction, {
      fulfilled: (state, action) => {
        const { payload } = action;
        const { id, ...changes } = payload;
        dbAdapter.updateOne(state, { id, changes });
      },
    }),
  }),
});

export const { upsertMany, deleteData, patchData, read, write, queryServer } =
  dbSlice.actions;
export default dbSlice.reducer;

export const selectByTypes = (state, types: DataType[]) => {
  return selectAll(state).filter((item) => types.includes(item.type));
};

export const selectByType = (state, type: DataType) => {
  return selectAll(state).filter((item) => item.type === type);
};
