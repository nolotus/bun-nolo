// app/theme/themeSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import { blue } from "./blue";
import { purple } from "./purple";
import { green } from "./green";
import { orange } from "./orange";
import { red } from "./red";
import { yellow } from "./yellow";
import { graphite } from "./graphite";
import { pink } from "./pink";
// 主题色系配置
const THEME_COLORS = {
  blue,
  purple,
  green,
  orange,
  red,
  yellow,
  graphite,
  pink
};

// 明暗模式基础颜色
const MODE_COLORS = {
  light: {
    background: "#FFFFFF",
    backgroundSecondary: "#F9FAFB",
    backgroundGhost: "rgba(255, 255, 255, 0.9)",
    text: "#111827",
    textSecondary: "#4B5563",
    textTertiary: "#666666",
    textLight: "#888888",
    placeholder: "#9CA3AF",
    border: "#E5E7EB",
    borderHover: "#D1D5DB",
    borderLight: "rgba(255, 255, 255, 0.3)",
    error: "#ef4444",
    shadowLight: "rgba(0,0,0,0.06)",
    shadowMedium: "rgba(0,0,0,0.08)",
    shadowHeavy: "rgba(0,0,0,0.1)",
    dropZoneActive: "rgba(0, 98, 255, 0.08)",
  },
  dark: {
    background: "#1A1A1A",
    backgroundSecondary: "#262626",
    backgroundGhost: "rgba(26, 26, 26, 0.9)",
    text: "#FFFFFF",
    textSecondary: "#A3A3A3",
    textTertiary: "#8C8C8C",
    textLight: "#666666",
    placeholder: "#595959",
    border: "#333333",
    borderHover: "#404040",
    borderLight: "rgba(26, 26, 26, 0.3)",
    icon: "#A3A3A3",
    error: "#ff4d4f",
    shadowLight: "rgba(0,0,0,0.15)",
    shadowMedium: "rgba(0,0,0,0.2)",
    shadowHeavy: "rgba(0,0,0,0.25)",
    dropZoneActive: "rgba(51, 204, 255, 0.08)",
  }
};

// 创建完整主题配置
const createThemeConfig = (themeName: string, isDark: boolean) => {
  const mode = isDark ? 'dark' : 'light';
  return {
    sidebarWidth: 260,
    ...MODE_COLORS[mode],
    ...THEME_COLORS[themeName][mode],
  };
};

// 为主题预计算明暗版本
const createThemeVariants = (themeName: string) => ({
  light: createThemeConfig(themeName, false),
  dark: createThemeConfig(themeName, true)
});

const initialState = {
  themeName: 'blue',
  isDark: false,
  // 预计算完整主题配置
  current: createThemeVariants('blue'),
  sidebarWidth: 260
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action) => {
      const newTheme = action.payload;
      if (THEME_COLORS[newTheme]) {
        state.themeName = newTheme;
        state.current = createThemeVariants(newTheme);
      }
    },

    setSidebarWidth: (state, action) => {
      const width = action.payload;
      state.sidebarWidth = width;
      state.current.light.sidebarWidth = width;
      state.current.dark.sidebarWidth = width;
    },

    setDarkMode: (state, action) => {
      state.isDark = action.payload;
    }
  }
});

export const { setTheme, setSidebarWidth, setDarkMode } = themeSlice.actions;

// 简化的选择器 - 直接返回预计算的主题配置
export const selectTheme = (state) => 
  state.theme.isDark ? state.theme.current.dark : state.theme.current.light;

export const selectIsDark = (state) => state.theme.isDark;

export default themeSlice.reducer;
