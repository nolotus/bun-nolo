import {
  asyncThunkCreator,
  buildCreateSlice,
  createEntityAdapter,
  createSelector,
} from "@reduxjs/toolkit";
import type { NoloRootState } from "app/store";
import { selectCurrentServer } from "setting/settingSlice";

import { selectIsLoggedIn } from "auth/authSlice";
import { deleteAction } from "./action/delete";
import { removeFromListAction } from "./action/listAction";
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
    queryServer: create.asyncThunk(queryServerAction, {
      fulfilled: (state, action) => {},
    }),
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
    write: create.asyncThunk(writeAction),
    upsertMany: dbAdapter.upsertMany,
    patchData: create.asyncThunk(patchAction, {
      fulfilled: (state, action) => {
        const { payload } = action;
        const { id, ...changes } = payload;
        dbAdapter.updateOne(state, { id, changes });
      },
    }),

    setOne: dbAdapter.setOne,
    removeFromList: create.asyncThunk(removeFromListAction, {}),
    query: create.asyncThunk(async (queryConfig, thunkAPI) => {
      const state = thunkAPI.getState();
      const currentServer = selectCurrentServer(state);
      const config = { server: currentServer, ...queryConfig };
      const isLoggedIn = selectIsLoggedIn(state);
      if (isLoggedIn) {
        const actionResult = await thunkAPI.dispatch(queryServer(config));
      }
    }, {}),
  }),
});
export const selectEntitiesByIds = createSelector(
  [(state) => state, (state, ids) => ids],
  (state, ids) => ids.map((id) => selectById(state, id))
);
export const {
  setOne,
  upsertMany,
  deleteData,
  patchData,
  read,
  syncQuery,
  write,
  removeFromList,
  queryServer,
  query,
} = dbSlice.actions;
export default dbSlice.reducer;

export const selectByTypes = (state, types: DataType[]) => {
  return selectAll(state).filter((item) => types.includes(item.type));
};

export const selectByType = (state, type: DataType) => {
  return selectAll(state).filter((item) => item.type === type);
};
