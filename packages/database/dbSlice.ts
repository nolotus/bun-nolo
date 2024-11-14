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
import { requestServers } from "utils/request";

import { API_ENDPOINTS } from "./config";
import { noloReadRequest } from "database/read/readRequest";
import { noloWriteRequest } from "./write/writeRequest";
import { noloQueryRequest } from "./client/queryRequest";
import { noloPutRequest } from "./client/putRequest";
import { generateIdWithCustomId } from "core/generateMainKey";
import { selectCurrentUser } from "auth/authSlice";
import { noloPatchRequest } from "./client/patchRequest";

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
        const dispatch = thunkApi.dispatch;

        const token = state.auth.currentToken;
        if (source) {
          //source 第一优先级
          const res = await noloReadRequest(source[0], id, token);
          if (res.status === 200) {
            const result = await res.json();
            return result;
          }
        } else {
          const isAutoSync = state.settings.syncSetting.isAutoSync;
          const currentServer = selectCurrentServer(state);
          if (!isAutoSync) {
            //current 第二优先级
            const res = await noloReadRequest(currentServer, id, token);
            if (res.status === 200) {
              const result = await res.json();
              return result;
            } else {
              throw new Error(`Request failed with status code ${res.status}`);
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
      },
      {
        rejected: (state, action) => {},
        fulfilled: (state, action) => {
          if (action.payload) {
            dbAdapter.upsertOne(state, action.payload);
          }
        },
      },
    ),
    deleteData: create.asyncThunk(
      async (args, thunkApi) => {
        const { id, body } = args;
        const { dispatch, getState } = thunkApi;
        const state = getState();
        const currentServer = selectCurrentServer(state);

        //todo add delete from local
        let headers = {
          "Content-Type": "application/json",
        };
        if (state.auth) {
          const token = state.auth.currentToken;
          headers.Authorization = `Bearer ${token}`;
        }
        const url = currentServer + `${API_ENDPOINTS.DATABASE}/delete/${id}`;

        const res = await fetch(url, {
          method: "DELETE",
          headers,
          body: JSON.stringify(body),
        });

        if (res.status === 200) {
          const result = await res.json();
          return result;
        }
      },
      {
        fulfilled: (state, action) => {
          const id = action.payload.id;
          dbAdapter.removeOne(state, id);
        },
      },
    ),
    write: create.asyncThunk(
      async (writeConfig, thunkApi) => {
        const state = thunkApi.getState();
        const dispatch = thunkApi.dispatch;
        // thunkApi.dispatch(syncWrite(state));
        let userId;
        const { id, flags, data } = writeConfig;
        const customId = id ? id : ulid();
        const { isJSON, isList, isObject } = flags;
        if (writeConfig.userId) {
          userId = writeConfig.userId;
        } else {
          const currenUserId = selectCurrentUser(state);
          userId = currenUserId;
        }
        const saveId = generateIdWithCustomId(userId, customId, flags);
        if (!!data.type) {
        }
        const willSaveData = { ...data, created: new Date().toISOString() };
        //local save
        if (isJSON || isObject) {
          dispatch(
            addOne({
              id: saveId,
              ...willSaveData,
            }),
          );
          //server save
          const serverWriteConfig = {
            ...writeConfig,
            data: willSaveData,
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
    setData: create.asyncThunk(
      async (updateConfig, thunkApi) => {
        const { id, data } = updateConfig;
        const state = thunkApi.getState();
        const res = await noloPutRequest(state, id, data);
        const result = await res.json();
        return result;
      },
      {
        fulfilled: (state, action) => {
          const one = action.payload.data;
          dbAdapter.setOne(state, one);
        },
      },
    ),
    upsertData: create.asyncThunk(
      async (saveConfig, thunkApi) => {
        const dispatch = thunkApi.dispatch;
        const id = saveConfig.id;
        const readAction = await dispatch(read({ id }));
        if (readAction.error) {
          const { data } = saveConfig;
          const dataBelongUserId = extractUserId(saveConfig.id);
          const id = extractCustomId(saveConfig.id);
          const flags = extractAndDecodePrefix(saveConfig.id);
          const writeConfig = {
            userId: dataBelongUserId,
            data: { ...data },
            flags,
            id,
          };
          const writeRes = await dispatch(write(writeConfig));
        } else {
          const updateRes = await dispatch(setData({ ...saveConfig, id }));
          return updateRes.payload.data;
        }
      },
      {
        fulfilled: (state, action) => {
          dbAdapter.upsertOne(state, action);
        },
      },
    ),
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
    patchData: create.asyncThunk(
      async ({ id, changes }, thunkApi) => {
        const state = thunkApi.getState();
        const res = await noloPatchRequest(state, id, changes);
        const { data } = await res.json();
        return data;
      },
      {
        fulfilled: (state, action) => {
          const { payload } = action;
          const { id, ...changes } = payload;
          dbAdapter.updateOne(state, { id, changes });
        },
      },
    ),

    addOne: dbAdapter.addOne,
    setOne: dbAdapter.setOne,
    addToList: create.asyncThunk(async ({ willAddId, updateId }, thunkApi) => {
      const state = thunkApi.getState();
      const currentServer = selectCurrentServer(state);
      const token = state.auth.currentToken;

      const res = await fetch(
        `${currentServer}${API_ENDPOINTS.PUT}/${updateId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: willAddId,
          }),
        },
      );

      const result = await res.json();
      return result;
    }, {}),
    query: create.asyncThunk(async (queryConfig, thunkAPI) => {
      const state = thunkAPI.getState();
      const currentServer = selectCurrentServer(state);
      const config = { server: currentServer, ...queryConfig };

      const actionResult = await thunkAPI.dispatch(queryServer(config));
    }, {}),
  }),
});
export const selectEntitiesByIds = createSelector(
  [(state) => state, (state, ids) => ids],
  (state, ids) => ids.map((id) => selectById(state, id)),
);
createSelectorCreator;
export const {
  upsertOne,
  setOne,
  mergeMany,
  deleteData,
  patchData,
  setData,
  upsertData,
  read,
  syncQuery,
  write,
  addOne,
  addToList,
  queryServer,
  query,
} = dbSlice.actions;
export default dbSlice.reducer;
