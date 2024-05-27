import { NoloRootState } from "app/store";
import {
  PayloadAction,
  buildCreateSlice,
  asyncThunkCreator,
  createEntityAdapter,
  createSelector,
  createSelectorCreator,
} from "@reduxjs/toolkit";
import { noloRequest } from "utils/noloRequest";
import { selectSyncServer } from "setting/settingSlice";

import { API_ENDPOINTS } from "./config";
import { noloReadRequest } from "./client/readRequest";
import { noloWriteRequest } from "./client/writeRequest";
import { noloQueryRequest } from "./client/queryRequest";

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
        try {
          const state = thunkApi.getState();
          const res = await noloQueryRequest(state, queryConfig);
          const result = await res.json();
          if (res.status === 200) {
            return result;
          } else {
            const { error } = result;
            throw error;
          }
        } catch (error) {
          throw error; // 可以重新抛出异常，让调用者知道发生了错误
        }
      },
      {
        fulfilled: (state, action) => {
          dbAdapter.upsertMany(state, action.payload);
        },
      },
    ),
    syncQuery: create.asyncThunk(
      async (queryConfig, thunkApi) => {
        const state = thunkApi.getState();
        const syncServers = selectSyncServer(state);
        const { queryUserId, options } = queryConfig;
        let headers = {
          "Content-Type": "application/json",
        };
        const queryParams = new URLSearchParams({
          isObject: (options.isObject ?? false).toString(),
          isJSON: (options.isJSON ?? false).toString(),
          limit: options.limit?.toString() ?? "",
        });
        const body = JSON.stringify(options.condition);
        const makeRequest = async (server) => {
          const url = `${API_ENDPOINTS.DATABASE}/query/${queryUserId}?${queryParams}`;
          const fullUrl = server + url;
          const response = await fetch(fullUrl, {
            method: "POST",
            headers,
            body,
          });
          const data = await response.json();
          thunkApi.dispatch(upsertMany({ data, server }));
          return data;
        };

        const results = await Promise.all(
          syncServers.map((server) => makeRequest(server)),
        );
      },
      {
        fulfilled: (state, action) => {},
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
    deleteData: create.asyncThunk(
      async (id, thunkApi) => {
        thunkApi.dispatch(removeOne(id));
        const state = thunkApi.getState();

        const res = await noloRequest(state, {
          url: `${API_ENDPOINTS.DATABASE}/delete/${id}`,
          method: "DELETE",
        });
        const result = await res.json();
        return result;
      },
      {
        fulfilled: (state, action) => {
          console.log("deleteData fulfilled", action);
          //double remove !
          dbAdapter.removeOne(state, action.payload.id);
        },
      },
    ),
    write: create.asyncThunk(
      async (writeConfig, thunkApi) => {
        const state = thunkApi.getState();
        // thunkApi.dispatch(syncWrite(state));
        const writeRes = await noloWriteRequest(state, writeConfig);
        return await writeRes.json();
      },
      {
        pending: (state, action) => {},
        fulfilled: () => {},
      },
    ),
    // syncWrite: create.asyncThunk(
    //   async (writeConfig, thunkApi) => {
    //     const state = thunkApi.getState();
    //     // const writeRes = await noloWriteRequest(state, writeConfig);
    //     const makeRequest = async (server) => {
    //       const url = `${API_ENDPOINTS.DATABASE}/write/`;
    //       const fullUrl = server + url;
    //       let headers = {
    //         "Content-Type": "application/json",
    //       };
    //       const response = await fetch(fullUrl, {
    //         method: "POST",
    //         headers,
    //         body,
    //       });
    //       const data = await response.json();
    //       thunkApi.dispatch(upsertMany({ data, server }));
    //       return data;
    //     };

    //     const results = await Promise.all(
    //       syncServers.map((server) => makeRequest(server)),
    //     );
    //     return await writeRes.json();
    //   },
    //   {
    //     pending: (state, action) => {},
    //     fulfilled: () => {},
    //   },
    // ),
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

    removeOne: create.reducer((state, action) => {
      dbAdapter.removeOne(state, action.payload);
    }),
    upsertOne: create.reducer((state, action) => {
      dbAdapter.upsertOne(state, action.payload);
    }),
    upsertMany: create.reducer((state, action) => {
      const { data, server } = action.payload;
      // console.log("data", data);
      const withSourceData = data.map((item) => {
        // console.log("item", item.id);
        // console.log(`state ${server}`, state.entities);
        const exist = state.entities[item.id];
        // console.log("exist", exist);

        if (exist) {
          const mergeBefore = {
            ...item,
            source: [...withSourceData.server, server],
          };
          return mergeBefore;
        }
        const mergeFirst = { ...item, source: [server] };
        // console.log("mergeFirst", mergeFirst);
        return mergeFirst;
      });
      dbAdapter.upsertMany(state, withSourceData);
    }),

    updateOne: create.reducer((state, action) => {
      dbAdapter.updateOne(state, {
        id: action.payload.id,
        changes: action.payload.changes,
      });
    }),
  }),
});
export const selectEntitiesByIds = createSelector(
  [(state) => state, (state, ids) => ids],
  (state, ids) => ids.map((id) => selectById(state, id)),
);
createSelectorCreator;
export const {
  updateData,
  removeOne,
  upsertOne,
  upsertMany,
  deleteData,
  updateOne,
  query,
  read,
  syncQuery,
  write,
} = dbSlice.actions;
export default dbSlice.reducer;
