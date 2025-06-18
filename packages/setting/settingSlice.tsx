import type { RootState } from "app/store";
import { buildCreateSlice, asyncThunkCreator } from "@reduxjs/toolkit";
import { isProduction } from "utils/env";
import { read, upsert } from "database/dbSlice";
import { createUserKey } from "database/keys";
import { selectCurrentUserId } from "auth/authSlice";
import { DataType } from "create/types";
import { SERVERS } from "database/requests"; // <--- 1. 导入集中的服务器配置

interface SettingState {
  isAutoSync: boolean;
  currentServer: string;
  defaultSpaceId?: string | null;
  syncServers: string[];
  showThinking: boolean;
  [key: string]: any; // 保持灵活性以兼容未来可能添加的设置
}

const initialState: SettingState = {
  isAutoSync: false,
  currentServer: isProduction ? SERVERS.MAIN : SERVERS.US,
  defaultSpaceId: null,
  // syncServers 也应使用统一的服务器列表
  syncServers: Object.values(SERVERS),
  showThinking: true,
};

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

const settingSlice = createSliceWithThunks({
  name: "settings",
  initialState,
  reducers: (create) => ({
    // 同步 Reducers
    addHostToCurrentServer: (state, action: { payload: string }) => {
      const hostname = action.payload;
      if (typeof hostname !== "string" || hostname.trim() === "") {
        console.warn("Invalid hostname provided to addHostToCurrentServer");
        return;
      }
      const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
      const isLocal =
        ["nolotus.local", "localhost"].includes(hostname) || isIpAddress;
      const protocol = isLocal ? "http" : "https";
      state.currentServer = `${protocol}://${hostname}`; // 简化URL构建，端口通常由环境处理
    },

    toggleShowThinking: (state) => {
      state.showThinking = !state.showThinking;
    },

    // 异步 Thunks
    getSettings: create.asyncThunk(
      async (userId: string, { dispatch }) => {
        const id = createUserKey.settings(userId);
        // 3. 简化 Thunk 逻辑，unwrap() 会自动处理 Promise 拒绝
        // 无需额外的 try/catch，错误将在 rejected case 中被捕获
        return await dispatch(read(id)).unwrap();
      },
      {
        fulfilled: (state, action) => {
          const loadedSettings = action.payload;
          if (loadedSettings) {
            // 使用 Object.assign 更简洁地合并已存在的设置
            Object.assign(state, loadedSettings);
          } else {
            console.log("No existing settings found, using default state.");
          }
        },
        rejected: (state, action) => {
          console.error("Failed to get settings:", action.error.message);
          // 当获取失败时，可以保持当前状态或重置为初始状态
          // 此处选择保持当前状态，仅记录错误
        },
      }
    ),

    setSettings: create.asyncThunk(
      async (args: Partial<Omit<SettingState, "type">>, thunkAPI) => {
        const { dispatch, getState } = thunkAPI;
        const state = getState() as RootState;
        const userId = selectCurrentUserId(state);

        if (!userId) {
          throw new Error("Cannot set settings: User ID not found.");
        }

        const customKey = createUserKey.settings(userId);
        const dataToUpsert = { ...args, type: DataType.SETTING };

        // 3. 同样简化 Thunk 逻辑，移除多余的 try/catch
        return await dispatch(
          upsert({ dbKey: customKey, data: dataToUpsert })
        ).unwrap();
      },
      {
        fulfilled: (state, action) => {
          const upsertedData = action.payload;
          if (upsertedData) {
            // 直接合并返回的数据，确保UI立即响应更新
            Object.assign(state, upsertedData);
            console.log("Settings successfully updated in state.");
          }
        },
        rejected: (state, action) => {
          console.error("Failed to set settings:", action.error.message);
          // 可以在此派发一个通知 action，告知用户设置失败
        },
      }
    ),
  }),
});

// --- 导出 Actions ---
export const {
  addHostToCurrentServer,
  toggleShowThinking,
  getSettings,
  setSettings,
} = settingSlice.actions;

// --- 导出 Selectors ---
export const selectCurrentServer = (state: RootState): string =>
  state.settings.currentServer;
export const selectSyncServers = (state: RootState): string[] =>
  state.settings.syncServers;
export const selectDefaultSpaceId = (
  state: RootState
): string | null | undefined => state.settings.defaultSpaceId;
export const selectShowThinking = (state: RootState): boolean =>
  state.settings.showThinking;

// --- 导出 Reducer ---
export default settingSlice.reducer;
