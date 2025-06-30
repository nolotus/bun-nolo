import {
  buildCreateSlice,
  asyncThunkCreator,
  createSelector,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type { RootState } from "app/store";
import { isProduction } from "utils/env";
import { read, patch } from "database/dbSlice";
import { createUserKey } from "database/keys";
import { SERVERS } from "database/requests";
import { selectUserId } from "auth/authSlice";

// 从分离的配置文件导入静态主题数据
import { SPACE, THEME_COLORS, MODE_COLORS } from "app/theme/theme.config";

// --- State 定义 (包含所有字段) ---
interface SettingState {
  isAutoSync: boolean;
  currentServer: string;
  defaultSpaceId?: string | null;
  syncServers: string[];
  showThinking: boolean;
  maxRounds: number;
  maxCost: number;
  themeName: keyof typeof THEME_COLORS;
  isDark: boolean;
  sidebarWidth: number;
  headerHeight: number;
  themeFollowsSystem: boolean;
  [key: string]: any;
}

// --- 初始状态 (包含所有字段的默认值) ---
const initialState: SettingState = {
  isAutoSync: false,
  currentServer: isProduction ? SERVERS.MAIN : SERVERS.US,
  defaultSpaceId: null,
  syncServers: Object.values(SERVERS),
  showThinking: true,
  maxRounds: 10,
  maxCost: 1,
  themeName: "blue",
  isDark: false,
  sidebarWidth: 260,
  headerHeight: 48,
  themeFollowsSystem: false,
};

// --- Slice 创建 ---
const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

const settingSlice = createSliceWithThunks({
  name: "settings",
  initialState,
  reducers: (create) => ({
    // --- 内部同步 Reducer ---
    _updateSettingsState: (
      state,
      action: PayloadAction<Partial<SettingState>>
    ) => {
      Object.assign(state, action.payload);
    },

    // --- 原始同步 Reducer ---
    addHostToCurrentServer: (state, action: PayloadAction<string>) => {
      const hostname = action.payload;
      if (typeof hostname !== "string" || hostname.trim() === "") return;
      const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
      const isLocal =
        ["nolotus.local", "localhost"].includes(hostname) || isIpAddress;
      const protocol = isLocal ? "http" : "https";
      state.currentServer = `${protocol}://${hostname}`;
    },

    // --- 异步 Thunks ---
    getSettings: create.asyncThunk(
      async (_, { dispatch, getState }) => {
        const userId = selectUserId(getState() as RootState);
        if (!userId) return null;
        return await dispatch(read(createUserKey.settings(userId))).unwrap();
      },
      {
        fulfilled: (state, action) => {
          if (action.payload) Object.assign(state, action.payload);
        },
      }
    ),

    // 核心 Thunk：批量更新设置并持久化
    setSettings: create.asyncThunk(
      async (changes: Partial<SettingState>, { dispatch, getState }) => {
        dispatch(settingSlice.actions._updateSettingsState(changes));
        const userId = selectUserId(getState() as RootState);
        if (!userId) throw new Error("User not found for persisting settings.");
        await dispatch(
          patch({ dbKey: createUserKey.settings(userId), changes })
        ).unwrap();
        return changes;
      }
    ),

    // --- 具体的原子化 Thunks (全部复用 setSettings) ---
    changeTheme: create.asyncThunk(
      async (themeName: keyof typeof THEME_COLORS, { dispatch }) =>
        dispatch(setSettings({ themeName })).unwrap()
    ),

    changeDarkMode: create.asyncThunk(async (isDark: boolean, { dispatch }) =>
      dispatch(setSettings({ isDark, themeFollowsSystem: false })).unwrap()
    ),

    toggleShowThinking: create.asyncThunk(async (_, { dispatch, getState }) => {
      const currentShowThinking = (getState() as RootState).settings
        .showThinking;
      return dispatch(
        setSettings({ showThinking: !currentShowThinking })
      ).unwrap();
    }),

    setThemeFollowsSystem: create.asyncThunk(
      async (follows: boolean, { dispatch }) =>
        dispatch(setSettings({ themeFollowsSystem: follows })).unwrap()
    ),

    // 【新增】设置侧边栏宽度并持久化
    setSidebarWidth: create.asyncThunk(
      async (sidebarWidth: number, { dispatch }) =>
        dispatch(setSettings({ sidebarWidth })).unwrap()
    ),
  }),
});

// --- 导出 Actions (已包含所有，包括 setSidebarWidth) ---
export const {
  getSettings,
  setSettings,
  addHostToCurrentServer,
  changeTheme,
  changeDarkMode,
  toggleShowThinking,
  setThemeFollowsSystem,
  setSidebarWidth, // 【已导出】
} = settingSlice.actions;

// --- 导出 Selectors (已包含所有) ---
export const selectSettings = (state: RootState) => state.settings;
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
export const selectIsDark = (state: RootState): boolean =>
  state.settings.isDark;
export const selectHeaderHeight = (state: RootState): number =>
  state.settings.headerHeight;
export const selectThemeName = (state: RootState): keyof typeof THEME_COLORS =>
  state.settings.themeName;
export const selectThemeFollowsSystem = (state: RootState): boolean =>
  state.settings.themeFollowsSystem;
export const selectSidebarWidth = (state: RootState): number =>
  state.settings.sidebarWidth; // 【已存在且正确】

// --- 高性能的记忆化 Selector ---
export const selectTheme = createSelector(
  [selectThemeName, selectIsDark, selectSidebarWidth, selectHeaderHeight],
  (themeName, isDark, sidebarWidth, headerHeight) => {
    const mode = isDark ? "dark" : "light";
    const validThemeName = THEME_COLORS[themeName] ? themeName : "blue";
    return {
      sidebarWidth,
      headerHeight,
      space: SPACE,
      ...MODE_COLORS[mode],
      ...THEME_COLORS[validThemeName][mode],
    };
  }
);

// --- 导出 Reducer ---
export default settingSlice.reducer;
