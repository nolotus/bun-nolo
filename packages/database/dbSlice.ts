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
import { selectSyncServers } from "setting/settingSlice";
import { extractAndDecodePrefix, extractCustomId, extractUserId } from "core";
import { ulid } from "ulid";

import { API_ENDPOINTS } from "./config";
import { noloReadRequest } from "./client/readRequest";
import { noloWriteRequest } from "./client/writeRequest";
import { noloQueryRequest } from "./client/queryRequest";
import { noloUpdateRequest } from "./client/updateRequest";
import { generateIdWithCustomId } from "core/generateMainKey";

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
        const syncServers = selectSyncServers(state);
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
    syncRead: create.asyncThunk(() => {}, {}),
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
        const dispatch = thunkApi.dispatch;
        // thunkApi.dispatch(syncWrite(state));
        const { id, flags, data, userId } = writeConfig;
        const customId = id ? id : ulid();
        const { isJSON, isList } = flags;
        let config = {
          flags,
          data,
        };
        const saveId = generateIdWithCustomId(userId, customId, flags);
        if (isJSON) {
          const saveData = { id: saveId, ...data };
          dispatch(addOne(saveData));
        }
        if (isList) {
          const saveData = { id: saveId, array: data };
          dispatch(addOne(saveData));
        }
        config = {
          ...writeConfig,
          customId,
        };

        const writeRes = await noloWriteRequest(state, config);
        return await writeRes.json();
      },
      {
        pending: (state, action) => {},
        fulfilled: (state, action) => {},
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
    // updateData: create.reducer((state, action) => {
    //   const updatedData = action.payload.data.map((item) => {
    //     const existingItem = state.entities[item.id];
    //     return {
    //       ...item,
    //       source: mergeSource(existingItem, action.payload.source),
    //     };
    //   });
    //   dbAdapter.upsertMany(state, updatedData);
    // }),
    updateData: create.asyncThunk(
      async (updateConfig, thunkApi) => {
        const { id, data } = updateConfig;
        const state = thunkApi.getState();
        const res = await noloUpdateRequest(state, id, data);
        const result = await res.json();
        return result;
      },
      {
        fulfilled: (state, action) => {
          const one = action.payload.data;
          dbAdapter.upsertOne(state, one);
        },
      },
    ),
    saveData: create.asyncThunk(
      async (saveConfig, thunkApi) => {
        const dispatch = thunkApi.dispatch;
        const id = saveConfig.id;
        const readAction = await dispatch(read(id));
        const result = readAction.payload;

        if (result.error) {
          const { data } = saveConfig;
          const dataBelongUserId = extractUserId(saveConfig.id);
          const id = extractCustomId(saveConfig.id);
          const flags = extractAndDecodePrefix(saveConfig.id);
          const writeConfig = { userId: dataBelongUserId, data, flags, id };
          const writeRes = await dispatch(write(writeConfig));
        } else {
          const updateRes = await dispatch(updateData({ ...saveConfig, id }));
          return updateRes.payload.data;
        }
      },
      {
        fulfilled: (state, action) => {
          dbAdapter.upsertOne(state, action);
        },
      },
    ),
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
    addOne: dbAdapter.addOne,
  }),
});
export const selectEntitiesByIds = createSelector(
  [(state) => state, (state, ids) => ids],
  (state, ids) => ids.map((id) => selectById(state, id)),
);
createSelectorCreator;
export const {
  removeOne,
  upsertOne,
  upsertMany,
  deleteData,
  updateOne,
  query,
  read,
  syncQuery,
  write,
  updateData,
  saveData,
  addOne,
} = dbSlice.actions;
export default dbSlice.reducer;
