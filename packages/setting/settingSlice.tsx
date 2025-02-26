import type { NoloRootState } from "app/store";
import { buildCreateSlice, asyncThunkCreator } from "@reduxjs/toolkit";
import { isProduction } from "utils/env";
import { read, write } from "database/dbSlice";
import { createUserKey } from "database/keys";
import { selectCurrentUserId } from "auth/authSlice";

interface SettingState {
  isAutoSync: boolean;
  currentServer: string;
  defaultSpaceId?: string;
  syncServers: string[];
}
const initialState: SettingState = {
  isAutoSync: false,
  currentServer: isProduction ? "https://cybot.one" : "https://cybot.run",
  syncServers: ["https://nolotus.com", "https://us.nolotus.com"],
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
        if (settings) {
          return settings;
        }
      },
      {
        fulfilled: (state, action) => {
          const newSettings = action.payload;
          state.defaultSpaceId = newSettings.defaultSpaceId;
          state.isAutoSync = newSettings.isAutoSync;
        },
      }
    ),

    addHostToCurrentServer: (state, action) => {
      const hostname = action.payload;
      const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
      const isHttp =
        hostname === "nolotus.local" || isIpAddress || hostname === "localhost";
      const protocol = isHttp ? "http" : "https";
      const port = isHttp ? "80" : "443";
      state.currentServer = `${protocol}://${hostname}:${port}`;
    },
    setSettings: create.asyncThunk(async (args, thunkAPI) => {
      const dispatch = thunkAPI.dispatch;
      const state = thunkAPI.getState();
      const currentSettings = state.settings;
      const userId = selectCurrentUserId(state);
      const updatedSettings = { ...currentSettings, ...args };
      const customKey = createUserKey.settings(userId);
      const result = await dispatch(
        write({
          data: updatedSettings,
          customKey,
        })
      ).unwrap();
      console.log("result", result);
    }),
  }),
});

export const { addHostToCurrentServer, getSettings, setSettings } =
  settingSlice.actions;

export const selectCurrentServer = (state: NoloRootState): string =>
  state.settings.currentServer;
export const selectSyncServers = (state: NoloRootState): string =>
  state.settings.syncServers;

export default settingSlice.reducer;
