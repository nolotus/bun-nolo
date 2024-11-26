import { selectCurrentServer, selectSyncServers } from "setting/settingSlice";
import { noloReadRequest } from "database/read/readRequest";
import { requestServers } from "utils/request";
import { selectIsLoggedIn } from "auth/authSlice";

export const readAction = async ({ id }, thunkApi) => {
  const state = thunkApi.getState();
  const dispatch = thunkApi.dispatch;
  const isLoggedIn = selectIsLoggedIn(state);

  const token = state.auth.currentToken;

  if (!isLoggedIn) {
  }
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
      token,
    );
    return raceRes;
  }
};
