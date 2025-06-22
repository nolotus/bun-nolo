import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "app/store";
import { buildCreateSlice, asyncThunkCreator } from "@reduxjs/toolkit";
import { isProduction } from "utils/env";
import { read, upsert } from "database/dbSlice";
import { createUserKey } from "database/keys";
import { selectCurrentUserId } from "auth/authSlice";
import { DataType } from "create/types";
import { SERVERS } from "database/requests";

interface SettingState {
  isAutoSync: boolean;
  currentServer: string;
  defaultSpaceId?: string | null;
  syncServers: string[];
  showThinking: boolean;
  maxRounds: number; // 新增：最大执行轮次
  maxCost: number; // 新增：最大成本限制
  [key: string]: any; // 保持灵活性以兼容未来可能添加的设置
}

const initialState: SettingState = {
  isAutoSync: false,
  currentServer: isProduction ? SERVERS.MAIN : SERVERS.US,
  defaultSpaceId: null,
  syncServers: Object.values(SERVERS),
  showThinking: true,
  maxRounds: 10, // 新增：默认值
  maxCost: 1, // 新增：默认值 (例如：1美元)
};

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

const settingSlice = createSliceWithThunks({
  name: "settings",
  initialState,
  reducers: (create) => ({
    // 同步 Reducers
    addHostToCurrentServer: (state, action: PayloadAction<string>) => {
      const hostname = action.payload;
      if (typeof hostname !== "string" || hostname.trim() === "") {
        console.warn("Invalid hostname provided to addHostToCurrentServer");
        return;
      }
      const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
      const isLocal =
        ["nolotus.local", "localhost"].includes(hostname) || isIpAddress;
      const protocol = isLocal ? "http" : "https";
      state.currentServer = `${protocol}://${hostname}`;
    },

    toggleShowThinking: (state) => {
      state.showThinking = !state.showThinking;
    },

    // 异步 Thunks
    getSettings: create.asyncThunk(
      async (userId: string, { dispatch }) => {
        const id = createUserKey.settings(userId);
        return await dispatch(read(id)).unwrap();
      },
      {
        fulfilled: (state, action) => {
          const loadedSettings = action.payload;
          if (loadedSettings) {
            Object.assign(state, loadedSettings);
          } else {
            console.log("No existing settings found, using default state.");
          }
        },
        rejected: (state, action) => {
          console.error("Failed to get settings:", action.error.message);
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

        return await dispatch(
          upsert({ dbKey: customKey, data: dataToUpsert })
        ).unwrap();
      },
      {
        fulfilled: (state, action) => {
          const upsertedData = action.payload;
          if (upsertedData) {
            Object.assign(state, upsertedData);
            console.log("Settings successfully updated in state.");
          }
        },
        rejected: (state, action) => {
          console.error("Failed to set settings:", action.error.message);
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
export const selectMaxRounds = (state: RootState): number =>
  state.settings.maxRounds;
export const selectMaxCost = (state: RootState): number =>
  state.settings.maxCost;

// --- 导出 Reducer ---
export default settingSlice.reducer;
