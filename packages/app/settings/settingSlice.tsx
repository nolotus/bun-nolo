// app/settings/settingSlice.ts

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

  // 编辑器配置
  editorDefaultMode: "markdown" | "block";

  // 新增：白天 / 夜晚代码主题
  editorLightCodeTheme: string; // 浅色模式下的代码主题（比如 "default"）
  editorDarkCodeTheme: string; // 深色模式下的代码主题（比如 "okaidia"）

  editorWordCountEnabled: boolean;
  editorShortcuts: {
    heading: boolean;
    ulist: boolean;
    olist: boolean;
    quote: boolean;
    code: boolean;
    tasklist: boolean;
  };
  editorFontSize: number;
  editorAutoSave: boolean;
  editorAutoSaveInterval: number;
  editorLineNumbers: boolean;
  editorWordWrap: boolean;
  editorSpellCheck: boolean;
  editorTabSize: number;
  editorFontFamily: string;

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
  // 默认跟随系统
  themeFollowsSystem: true,

  // 编辑器默认配置
  editorDefaultMode: "markdown",

  // 默认：白天用 default，夜晚用 okaidia
  editorLightCodeTheme: "default",
  editorDarkCodeTheme: "okaidia",

  editorWordCountEnabled: true,
  editorShortcuts: {
    heading: true,
    ulist: true,
    olist: true,
    quote: true,
    code: true,
    tasklist: true,
  },
  editorFontSize: 14,
  editorAutoSave: true,
  editorAutoSaveInterval: 30,
  editorLineNumbers: false,
  editorWordWrap: true,
  editorSpellCheck: true,
  editorTabSize: 2,
  editorFontFamily: "SF Mono, Monaco, Cascadia Code, Roboto Mono, monospace",
};

// --- Slice 创建 ---
const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

const settingSlice = createSliceWithThunks({
  name: "settings",
  initialState,
  reducers: (create) => ({
    _updateSettingsState: (
      state,
      action: PayloadAction<Partial<SettingState>>
    ) => {
      Object.assign(state, action.payload);
    },
    addHostToCurrentServer: (state, action: PayloadAction<string>) => {
      const hostname = action.payload;
      if (typeof hostname !== "string" || hostname.trim() === "") return;
      const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
      const isLocal =
        ["nolotus.local", "localhost"].includes(hostname) || isIpAddress;
      const protocol = isLocal ? "http" : "https";
      state.currentServer = `${protocol}://${hostname}`;
    },
    getSettings: create.asyncThunk(
      async (_, { dispatch, getState }) => {
        const userId = selectUserId(getState() as RootState);
        if (!userId) return null;
        return await dispatch(read(createUserKey.settings(userId))).unwrap();
      },
      {
        fulfilled: (state, action) => {
          if (action.payload) {
            const { currentServer: _ignored, ...settingsToApply } =
              action.payload as SettingState;
            Object.assign(state, settingsToApply);
          }
        },
      }
    ),
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

    // 主题相关 actions
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
    setSidebarWidth: create.asyncThunk(
      async (sidebarWidth: number, { dispatch }) =>
        dispatch(setSettings({ sidebarWidth })).unwrap()
    ),

    // 编辑器配置相关 actions
    setEditorDefaultMode: create.asyncThunk(
      async (mode: "markdown" | "block", { dispatch }) =>
        dispatch(setSettings({ editorDefaultMode: mode })).unwrap()
    ),

    // 设置白天代码主题
    setEditorLightCodeTheme: create.asyncThunk(
      async (theme: string, { dispatch }) =>
        dispatch(setSettings({ editorLightCodeTheme: theme })).unwrap()
    ),

    // 设置夜晚代码主题
    setEditorDarkCodeTheme: create.asyncThunk(
      async (theme: string, { dispatch }) =>
        dispatch(setSettings({ editorDarkCodeTheme: theme })).unwrap()
    ),

    // 兼容旧接口：同时设置白天 + 夜晚为同一个主题
    setEditorCodeTheme: create.asyncThunk(async (theme: string, { dispatch }) =>
      dispatch(
        setSettings({
          editorLightCodeTheme: theme,
          editorDarkCodeTheme: theme,
        })
      ).unwrap()
    ),

    toggleEditorWordCount: create.asyncThunk(
      async (_, { dispatch, getState }) => {
        const current = (getState() as RootState).settings
          .editorWordCountEnabled;
        return dispatch(
          setSettings({ editorWordCountEnabled: !current })
        ).unwrap();
      }
    ),
    toggleEditorShortcut: create.asyncThunk(
      async (key: string, { dispatch, getState }) => {
        const currentShortcuts = (getState() as RootState).settings
          .editorShortcuts;
        const newShortcuts = {
          ...currentShortcuts,
          [key]: !currentShortcuts[key],
        };
        return dispatch(
          setSettings({ editorShortcuts: newShortcuts })
        ).unwrap();
      }
    ),
    setEditorFontSize: create.asyncThunk(
      async (fontSize: number, { dispatch }) =>
        dispatch(setSettings({ editorFontSize: fontSize })).unwrap()
    ),
    toggleEditorAutoSave: create.asyncThunk(
      async (_, { dispatch, getState }) => {
        const current = (getState() as RootState).settings.editorAutoSave;
        return dispatch(setSettings({ editorAutoSave: !current })).unwrap();
      }
    ),
    setEditorAutoSaveInterval: create.asyncThunk(
      async (interval: number, { dispatch }) =>
        dispatch(setSettings({ editorAutoSaveInterval: interval })).unwrap()
    ),
  }),
});

// --- 导出 Actions ---
export const {
  getSettings,
  setSettings,
  addHostToCurrentServer,
  changeTheme,
  changeDarkMode,
  toggleShowThinking,
  setThemeFollowsSystem,
  setSidebarWidth,
  // 编辑器 actions
  setEditorDefaultMode,
  setEditorLightCodeTheme,
  setEditorDarkCodeTheme,
  setEditorCodeTheme, // 兼容旧接口
  toggleEditorWordCount,
  toggleEditorShortcut,
  setEditorFontSize,
  toggleEditorAutoSave,
  setEditorAutoSaveInterval,
} = settingSlice.actions;

// --- 导出 Selectors ---
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
  state.settings.sidebarWidth;

// --- 编辑器相关 selectors（含白天 / 夜晚代码主题） ---
export const selectEditorDefaultMode = (
  state: RootState
): "markdown" | "block" => state.settings.editorDefaultMode;

export const selectEditorLightCodeTheme = (state: RootState): string =>
  state.settings.editorLightCodeTheme;

export const selectEditorDarkCodeTheme = (state: RootState): string =>
  state.settings.editorDarkCodeTheme;

// 当前「生效」的代码主题：根据 isDark 自动选择白天 / 夜晚配置
export const selectEditorCodeTheme = createSelector(
  [selectEditorLightCodeTheme, selectEditorDarkCodeTheme, selectIsDark],
  (lightTheme, darkTheme, isDark) => (isDark ? darkTheme : lightTheme)
);

export const selectEditorWordCountEnabled = (state: RootState): boolean =>
  state.settings.editorWordCountEnabled;
export const selectEditorShortcuts = (state: RootState) =>
  state.settings.editorShortcuts;
export const selectEditorFontSize = (state: RootState): number =>
  state.settings.editorFontSize;
export const selectEditorAutoSave = (state: RootState): boolean =>
  state.settings.editorAutoSave;
export const selectEditorAutoSaveInterval = (state: RootState): number =>
  state.settings.editorAutoSaveInterval;

// --- 高性能的记忆化 Selector（整体主题） ---
export const selectTheme = createSelector(
  [selectThemeName, selectIsDark, selectSidebarWidth, selectHeaderHeight],
  (themeName, isDark, sidebarWidth, headerHeight) => {
    const mode = isDark ? "dark" : "light";
    const validThemeName = THEME_COLORS[themeName] ? themeName : "blue";
    return {
      sidebarWidth: `${sidebarWidth}px`,
      headerHeight: `${headerHeight}px`,
      space: SPACE,
      ...MODE_COLORS[mode],
      ...THEME_COLORS[validThemeName][mode],
    };
  }
);

// 编辑器配置选择器：返回当前主题 + 白天/夜晚配置，方便 UI 做设置面板
export const selectEditorConfig = createSelector(
  [
    selectEditorDefaultMode,
    selectEditorLightCodeTheme,
    selectEditorDarkCodeTheme,
    selectEditorWordCountEnabled,
    selectEditorShortcuts,
    selectEditorFontSize,
    selectEditorAutoSave,
    selectEditorAutoSaveInterval,
    selectIsDark,
  ],
  (
    defaultMode,
    lightCodeTheme,
    darkCodeTheme,
    wordCountEnabled,
    shortcuts,
    fontSize,
    autoSave,
    autoSaveInterval,
    isDark
  ) => {
    const codeTheme = isDark ? darkCodeTheme : lightCodeTheme;
    return {
      defaultMode,
      codeTheme, // 当前实际生效的代码主题
      lightCodeTheme,
      darkCodeTheme,
      wordCountEnabled,
      shortcuts,
      fontSize,
      autoSave,
      autoSaveInterval,
    };
  }
);

// --- 导出 Reducer ---
export default settingSlice.reducer;
