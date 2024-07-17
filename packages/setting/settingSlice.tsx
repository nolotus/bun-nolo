import type { NoloRootState } from "app/store";
import { buildCreateSlice, asyncThunkCreator } from "@reduxjs/toolkit";
import { read } from "database/dbSlice";
import { generateCustomId } from "core/generateMainKey";
import { selectCurrentUserId } from "auth/authSlice";

interface SettingState {
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
    currentServer: "https://nolotus.com",
    officialServers: ["https://nolotus.com", "https://us.nolotus.com"],
    syncServers: ["https://nolotus.com", "https://us.nolotus.com"],
    thirdPartyServers: ["https://thirdparty.server.com"],
  },
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
    initSyncSetting: create.asyncThunk(
      async (payload, thunkAPI) => {
        const { dispatch } = thunkAPI;
        const state = thunkAPI.getState();
        const userId = selectCurrentUserId(state);
        const id = generateCustomId(userId, "sync-settings");
        const action = await dispatch(read({ id }));
        return action.payload;
      },
      {
        fulfilled: (state, action) => {
          state.syncSetting = { ...state.syncSetting, ...action.payload };
        },
      },
    ),
    updateCurrentServer: (state, action) => {
      state.syncSetting.currentServer = action.payload;
    },
    addSyncServer: (state, action) => {
      state.syncSetting.syncServers.push(action.payload);
    },
    removeSyncServer: (state, action) => {
      state.syncSetting.syncServers = state.syncSetting.syncServers.filter(
        (server) => server !== action.payload,
      );
    },
    addThirdPartyServer: (state, action) => {
      state.syncSetting.thirdPartyServers.push(action.payload);
    },
    removeThirdPartyServer: (state, action) => {
      state.syncSetting.thirdPartyServers =
        state.syncSetting.thirdPartyServers.filter(
          (server) => server !== action.payload,
        );
    },
    addHostToCurrentServer: (state, action) => {
      const hostname = action.payload;
      const protocol =
        hostname === "nolotus.local" || hostname.startsWith("192.168")
          ? "http"
          : "https";
      const port = protocol === "http" ? "80" : "443";
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
  initSyncSetting,
} = settingSlice.actions;

export const selectCurrentServer = (state: NoloRootState): string =>
  state.settings.syncSetting.currentServer;
export const selectSyncServers = (state: NoloRootState): string =>
  state.settings.syncSetting.syncServers;
export default settingSlice.reducer;
