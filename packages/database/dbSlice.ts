import {
  asyncThunkCreator,
  buildCreateSlice,
  createEntityAdapter,
  createSelector,
} from "@reduxjs/toolkit";
import type { NoloRootState } from "app/store";

import { deleteAction } from "./action/delete";
import { queryServerAction } from "./action/queryServer";
import { readAction } from "./action/read";
import { writeAction } from "./action/write";
import { patchAction } from "./action/patch";
import { DataType } from "create/types";
export const dbAdapter = createEntityAdapter();

export const { selectById, selectEntities, selectAll, selectIds, selectTotal } =
  dbAdapter.getSelectors((state: NoloRootState) => state.db);

const initialState = dbAdapter.getInitialState({});

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

// Slice
// 在 reducer 的相关操作处添加日志检查
const dbSlice = createSliceWithThunks({
  name: "db",
  initialState,
  reducers: (create) => ({
    queryServer: create.asyncThunk(queryServerAction),
    read: create.asyncThunk(readAction, {
      fulfilled: (state, action) => {
        if (action.payload) {
          if (!action.payload.id || Object.keys(action.payload).length === 0) {
            console.warn("Empty or invalid data detected in read action:", {
              payload: action.payload,
              stack: new Error().stack,
            });
          }
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
        if (!action.payload.id || Object.keys(action.payload).length === 0) {
          console.warn("Empty or invalid data detected in write action:", {
            payload: action.payload,
            stack: new Error().stack,
          });
        }
        dbAdapter.addOne(state, action.payload);
      },
    }),
    upsertMany: (state, action) => {
      if (
        action.payload.some(
          (item) => !item.id || Object.keys(item).length === 0
        )
      ) {
        console.warn("Empty or invalid data detected in upsertMany:", {
          payload: action.payload,
          stack: new Error().stack,
        });
      }
      dbAdapter.upsertMany(state, action.payload);
    },
    patchData: create.asyncThunk(patchAction, {
      fulfilled: (state, action) => {
        const { payload } = action;
        if (!payload.id || Object.keys(payload).length <= 1) {
          console.warn("Empty or invalid data detected in patch action:", {
            payload,
            stack: new Error().stack,
          });
        }
        const { id, ...changes } = payload;
        dbAdapter.updateOne(state, { id, changes });
      },
    }),
  }),
});

export const { upsertMany, deleteData, patchData, read, write, queryServer } =
  dbSlice.actions;
export default dbSlice.reducer;

export const selectByTypes = createSelector(
  [
    selectAll,
    (state, types: DataType[]) => types,
    (state, types: DataType[], userId?: string) => userId,
  ],
  (items, types, userId) => {
    return items.filter((item) => {
      const matchType = types.includes(item.type);
      return userId ? matchType && item.userId === userId : matchType;
    });
  }
);

export const selectByType = createSelector(
  [selectAll, (state, type: DataType) => type],
  (items, type) => {
    return items.filter((item) => item.type === type);
  }
);
