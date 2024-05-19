import { createSlice } from "@reduxjs/toolkit";
import type { NoloRootState } from "app/store";

interface SettingState {
  syncSetting: {
    currentServer: string;
    officialServers: string[];
    syncServers: string[];
    thirdPartyServers: string[];
  };
}
const initialState: SettingState = {
  syncSetting: {
    currentServer: "https://nolotus.com",
    officialServers: ["https://nolotus.com", "https://us.nolotus.com"],
    syncServers: ["https://nolotus.com", "https://us.nolotus.com"],
    thirdPartyServers: [
      "https://thirdparty.server1.com",
      "https://thirdparty.server2.com",
    ],
  },
};
// 创建一个新的slice
const settingSlice = createSlice({
  // 这个slice的名字
  name: "settings",
  // 初始状态
  initialState,
  // 包含reducer函数的对象
  reducers: {
    // 更新当前服务器地址的reducer
    updateCurrentServer: (state, action) => {
      state.syncSetting.currentServer = action.payload;
    },
    // 新增同步服务器地址的reducer
    addSyncServer: (state, action) => {
      state.syncSetting.syncServers.push(action.payload);
    },
    // 删除同步服务器地址的reducer
    removeSyncServer: (state, action) => {
      state.syncSetting.syncServers = state.syncSetting.syncServers.filter(
        (server) => server !== action.payload,
      );
    },
    // 新增第三方服务器地址的reducer
    addThirdPartyServer: (state, action) => {
      state.syncSetting.thirdPartyServers.push(action.payload);
    },
    // 删除第三方服务器地址的reducer
    removeThirdPartyServer: (state, action) => {
      state.syncSetting.thirdPartyServers =
        state.syncSetting.thirdPartyServers.filter(
          (server) => server !== action.payload,
        );
    },
    // 新增主机名到当前服务器的reducer
    addHostToCurrentServer: (state, action) => {
      const hostname = action.payload;
      const protocol = hostname === "nolotus.local" ? "http" : "https";
      const port = protocol === "http" ? "80" : "443";
      state.syncSetting.currentServer = `${protocol}://${hostname}:${port}`;
    },
  },
});

// 导出reducer和action creators
export const {
  updateCurrentServer,
  addSyncServer,
  removeSyncServer,
  addThirdPartyServer,
  removeThirdPartyServer,
  addHostToCurrentServer,
} = settingSlice.actions;

// 导出selectors
// 导出selectors
export const selectCurrentServer = (state: NoloRootState): string =>
  state.settings.syncSetting.currentServer;

export default settingSlice.reducer;
