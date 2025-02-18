import type { NoloRootState } from "app/store";
import { buildCreateSlice, asyncThunkCreator } from "@reduxjs/toolkit";
import { isProduction } from "utils/env";
import { read } from "database/dbSlice";
import { createUserKey } from "database/keys";
import { selectCurrentUserId } from "auth/authSlice";

interface SettingState {
  userSetting?: {
    defaultSpaceId?: string;
  };
  syncSetting: {
    isAutoSync: boolean;
    currentServer: string;
    officialServers: string[];
    syncServers: string[];
    thirdPartyServers: string[];
  };
}
const initialState: SettingState = {
  syncSetting: {
    isAutoSync: false,
    currentServer: isProduction ? "https://cybot.one" : "https://cybot.run",
    officialServers: ["https://nolotus.com", "https://us.nolotus.com"],
    syncServers: ["https://nolotus.com", "https://us.nolotus.com"],
    thirdPartyServers: ["https://thirdparty.server.com"],
  },
  userSetting: {},
};

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

const settingSlice = createSliceWithThunks({
  // 这个slice的名字
  name: "settings",
  // 初始状态
  initialState,
  // 包含reducer函数的对象
  reducers: (create) => ({
    getSettings: create.asyncThunk(
      // 添加 userId 参数
      async (userId: string, thunkAPI) => {
        const dispatch = thunkAPI.dispatch;
        // 使用传入的 userId 参数替代从 state 获取
        const id = createUserKey.settings(userId);
        const settings = await dispatch(read(id)).unwrap();
        return settings;
      },
      {
        fulfilled: (state, action) => {
          state.userSetting = action.payload;
        },
      }
    ),

    updateCurrentServer: (state, action) => {
      state.syncSetting.currentServer = action.payload;
    },
    addSyncServer: (state, action) => {
      state.syncSetting.syncServers.push(action.payload);
    },
    removeSyncServer: (state, action) => {
      state.syncSetting.syncServers = state.syncSetting.syncServers.filter(
        (server) => server !== action.payload
      );
    },
    addThirdPartyServer: (state, action) => {
      state.syncSetting.thirdPartyServers.push(action.payload);
    },
    removeThirdPartyServer: (state, action) => {
      state.syncSetting.thirdPartyServers =
        state.syncSetting.thirdPartyServers.filter(
          (server) => server !== action.payload
        );
    },
    addHostToCurrentServer: (state, action) => {
      const hostname = action.payload;
      const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
      const isHttp =
        hostname === "nolotus.local" || isIpAddress || hostname === "localhost";

      const protocol = isHttp ? "http" : "https";
      const port = isHttp ? "80" : "443";

      state.syncSetting.currentServer = `${protocol}://${hostname}:${port}`;
    },
  }),
});

export const {
  updateCurrentServer,
  addSyncServer,
  removeSyncServer,
  addThirdPartyServer,
  removeThirdPartyServer,
  addHostToCurrentServer,
  getSettings,
} = settingSlice.actions;

export const selectCurrentServer = (state: NoloRootState): string =>
  state.settings.syncSetting.currentServer;
export const selectSyncServers = (state: NoloRootState): string =>
  state.settings.syncSetting.syncServers;

export default settingSlice.reducer;
