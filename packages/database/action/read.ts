import { selectCurrentServer, selectSyncServers } from "setting/settingSlice";
import { noloReadRequest } from "database/read/readRequest";
import { requestServers } from "utils/request";
import { selectIsLoggedIn } from "auth/authSlice";
import { isV0Id } from "core/id";
import { browserDb } from "../browser/db";

export const readAction = async ({ id }, thunkApi) => {
  const state = thunkApi.getState();
  const isLoggedIn = selectIsLoggedIn(state);
  const token = state.auth.currentToken;
  if (!isV0Id(id)) {
    const result = await browserDb.get(id);
    console.log("readAction v1 result", result);
    return result;
  } else {
    const isAutoSync = state.settings.syncSetting.isAutoSync;
    const currentServer = selectCurrentServer(state);
    if (!isAutoSync) {
      //current 第二优先级
      if (isLoggedIn) {
        const res = await noloReadRequest(currentServer, id, token);
        if (res.status === 200) {
          const result = await res.json();
          return result;
        } else {
          throw new Error(`Request failed with status code ${res.status}`);
        }
      }
    } else {
      const syncServers = selectSyncServers(state);
      const raceRes = await requestServers(
        [currentServer, ...syncServers],
        id,
        token
      );
      return raceRes;
    }
  }
};
