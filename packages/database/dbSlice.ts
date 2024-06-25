import { NoloRootState } from "app/store";
import {
  PayloadAction,
  buildCreateSlice,
  asyncThunkCreator,
  createEntityAdapter,
  createSelector,
  createSelectorCreator,
} from "@reduxjs/toolkit";
import { selectCurrentServer, selectSyncServers } from "setting/settingSlice";
import { extractAndDecodePrefix, extractCustomId, extractUserId } from "core";
import { ulid } from "ulid";

import { API_ENDPOINTS } from "./config";
import { noloReadRequest } from "./client/readRequest";
import { noloWriteRequest } from "./write/writeRequest";
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
    queryServer: create.asyncThunk(
      async (queryConfig, thunkApi) => {
        const { dispatch } = thunkApi;
        const { server } = queryConfig;

        try {
          const res = await noloQueryRequest(queryConfig);
          const data = await res.json();
          if (res.status === 200) {
            dispatch(mergeMany({ data, server }));
            return data;
          } else {
            const { error } = result;
            throw error;
          }
        } catch (error) {
          throw error;
        }
      },
      {
        fulfilled: (state, action) => {},
      },
    ),
    read: create.asyncThunk(
      async ({ id, source }, thunkApi) => {
        const state = thunkApi.getState();

        const token = state.auth.currentToken;

        if (source) {
          const res = await noloReadRequest(source[0], id, token);
          if (res.status === 200) {
            const result = await res.json();
            return result;
          }
        } else {
          const isAutoSync = state.settings.syncSetting.isAutoSync;
          const currentServer = selectCurrentServer(state);

          if (!isAutoSync) {
            const res = await noloReadRequest(currentServer, id, token);
            if (res.status === 200) {
              const result = await res.json();
              return result;
            }
          } else {
            const syncServers = selectSyncServers(state);
            const raceRes = await requestServers(
              [currentServer, ...syncServers],
              id,
              token,
            );
            return raceRes;
          }
        }

        async function makeRequest(server, id, token) {
          try {
            const res = await noloReadRequest(server, id, token);
            if (res.status === 200) {
              const result = await res.json();
              return result;
            } else {
              throw new Error(`Request failed with status ${res.status}`);
            }
          } catch (error) {
            throw error; // 继续抛出错误
          }
        }
        async function requestServers(servers, id, token) {
          const requests = servers.map((server) =>
            makeRequest(server, id, token).catch((error) => error),
          );

          const results = await Promise.all(requests); // 等待所有请求完成
          const validResults = results.filter(
            (result) => !(result instanceof Error),
          ); // 过滤出成功的响应

          if (validResults.length > 0) {
            return validResults[0]; // 返回第一个成功的结果
          } else {
            throw new Error(
              "All servers failed to respond with a valid result.",
            );
          }
        }
      },
      {
        fulfilled: (state, action) => {
          if (action.payload) {
            dbAdapter.upsertOne(state, action.payload);
          }
        },
      },
    ),
    readServer: create.asyncThunk(() => {}, {}),
    syncRead: create.asyncThunk(() => {}, {}),
    deleteData: create.asyncThunk(
      async (args, thunkApi) => {
        const { id, body, source } = args;
        const { dispatch, getState } = thunkApi;
        const state = getState();
        thunkApi.dispatch(removeOne(id));
        const currentServer = selectCurrentServer(state);
        let headers = {
          "Content-Type": "application/json",
        };
        if (state.auth) {
          const token = state.auth.currentToken;
          headers.Authorization = `Bearer ${token}`;
        }
        if (source) {
          console.log("source");
          const dynamicUrl =
            source[0] + `${API_ENDPOINTS.DATABASE}/delete/${id}`;
          const res = await fetch(dynamicUrl, {
            method: "DELETE",
            headers,
            body,
          });
          console.log("deleteData", res);
          if (res.status === 200) {
            const result = await res.json();
            console.log("deleteData 200", result);
            return result;
          }
        } else {
          const dynamicUrl =
            currentServer + `${API_ENDPOINTS.DATABASE}/delete/${id}`;
          const res = await fetch(dynamicUrl, {
            method: "DELETE",
            headers,
            body,
          });
          console.log("deleteData", res);
          if (res.status === 200) {
            const result = await res.json();
            console.log("deleteData 200", result);
            return result;
          }
        }
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
        const saveId = generateIdWithCustomId(userId, customId, flags);
        const saveData = { ...data, created: new Date().toISOString() };
        //local save
        if (isJSON) {
          dispatch(
            addOne({
              id: saveId,
              ...saveData,
            }),
          );
          //server save
          const serverWriteConfig = {
            ...writeConfig,
            data: saveData,
            customId,
          };
          const writeRes = await noloWriteRequest(state, serverWriteConfig);
          return await writeRes.json();
        }
        if (isList) {
          dispatch(addOne({ id: saveId, array: data }));
          //server save
          const serverWriteConfig = {
            ...writeConfig,
            customId,
          };
          const writeRes = await noloWriteRequest(state, serverWriteConfig);
          return await writeRes.json();
        }
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
        const readAction = await dispatch(read({ id }));
        const result = readAction.payload;

        if (result.error) {
          const { data } = saveConfig;
          const dataBelongUserId = extractUserId(saveConfig.id);
          const id = extractCustomId(saveConfig.id);
          const flags = extractAndDecodePrefix(saveConfig.id);
          const writeConfig = {
            userId: dataBelongUserId,
            data: { ...data, create_at: new Date().toISOString() },
            flags,
            id,
          };
          const writeRes = await dispatch(write(writeConfig));
          console.log("writeRes", writeRes);
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
    mergeMany: create.reducer((state, action) => {
      const { data, server } = action.payload;
      const withSourceData = data.map((item) => {
        const exist = dbAdapter.selectId(item.id);
        if (exist) {
          const mergeBefore = {
            ...item,
            source: [...exist.server, server],
          };
          return mergeBefore;
        }
        return { ...item, source: [server] };
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
  mergeMany,
  deleteData,
  updateOne,
  read,
  syncQuery,
  write,
  updateData,
  saveData,
  addOne,
  queryServer,
  readServer,
} = dbSlice.actions;
export default dbSlice.reducer;
