import {
  asyncThunkCreator,
  buildCreateSlice,
  createEntityAdapter,
} from "@reduxjs/toolkit";
import type { NoloRootState } from "app/store";

import { removeAction } from "./action/remove";
import { queryServerAction } from "./action/queryServer";
import { readAction } from "./action/read";
import { writeAction } from "./action/write";
import { patchAction } from "./action/patch";

// 使用 dbKey 作为实体的唯一标识符
export const dbAdapter = createEntityAdapter({
  selectId: (entity) => entity.dbKey, // 指定 dbKey 作为 ID
});

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
          if (Object.keys(action.payload).length === 0) {
            console.warn("Empty or invalid data detected in read action:", {
              payload: action.payload,
              stack: new Error().stack,
            });
          }
          dbAdapter.upsertOne(state, action.payload);
        }
      },
    }),
    remove: create.asyncThunk(removeAction, {
      fulfilled: (state, action) => {
        const { dbKey } = action.payload;
        dbAdapter.removeOne(state, dbKey); // 使用 dbKey 移除
      },
    }),
    write: create.asyncThunk(writeAction, {
      fulfilled: (state, action) => {
        if (!action.payload.dbKey || Object.keys(action.payload).length === 0) {
          // 检查 dbKey
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
          (item) => !item.dbKey || Object.keys(item).length === 0 // 检查 dbKey
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
        if (!payload.dbKey || Object.keys(payload).length <= 1) {
          // 检查 dbKey
          console.warn("Empty or invalid data detected in patch action:", {
            payload,
            stack: new Error().stack,
          });
        }
        const { dbKey, ...changes } = payload; // 使用 dbKey 而不是 id
        dbAdapter.updateOne(state, { id: dbKey, changes }); // 使用 dbKey 作为 ID
      },
    }),
  }),
});

export const { upsertMany, remove, patchData, read, write, queryServer } =
  dbSlice.actions;

export default dbSlice.reducer;
