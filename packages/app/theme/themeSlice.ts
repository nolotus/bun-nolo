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
  pink,
};

// 明暗模式基础颜色
const MODE_COLORS = {
  light: {
    background: "#FFFFFF",
    backgroundSecondary: "#F9FAFB", // 更柔和的次级背景
    backgroundGhost: "rgba(255, 255, 255, 0.95)", // 更高的不透明度更舒适
    text: "#1A1F36", // 柔和但仍保持清晰的文本色
    textSecondary: "#4F566B", // 适中的次要文本
    textTertiary: "#697386", // 温和的第三级文本
    textLight: "#8792A2", // 柔和的浅色文本
    placeholder: "#A3ACB9", // 舒适的占位符颜色
    border: "#E9EBF0", // 非常柔和的边框色
    borderHover: "#D8DCE3", // 明显但不刺眼的悬停边框
    borderLight: "rgba(255, 255, 255, 0.4)",
    error: "#F05151", // 温和但清晰的错误色
    shadowLight: "rgba(0,0,0,0.04)",
    shadowMedium: "rgba(0,0,0,0.06)",
    shadowHeavy: "rgba(0,0,0,0.08)",
    dropZoneActive: "rgba(0, 102, 255, 0.06)",
  },
  dark: {
    background: "#141822", // 柔和的深色背景
    backgroundSecondary: "#1E2330", // 优雅的次级背景
    backgroundGhost: "rgba(20, 24, 34, 0.95)",
    text: "#E6E8ED", // 舒适的文本色
    textSecondary: "#B2B7C3", // 清晰但不刺眼
    textTertiary: "#8E95A3", // 恰到好处的第三级
    textLight: "#6B7280",
    placeholder: "#525A6B",
    border: "#2A303C", // 自然的边框
    borderHover: "#363D4B", // 明显的悬停状态
    borderLight: "rgba(20, 24, 34, 0.4)",
    icon: "#B2B7C3",
    error: "#FF5A5A", // 醒目但不刺眼
    shadowLight: "rgba(0,0,0,0.15)",
    shadowMedium: "rgba(0,0,0,0.2)",
    shadowHeavy: "rgba(0,0,0,0.25)",
    dropZoneActive: "rgba(102, 178, 255, 0.06)",
  },
};

// 创建完整主题配置
const createThemeConfig = (themeName: string, isDark: boolean) => {
  const mode = isDark ? "dark" : "light";
  return {
    sidebarWidth: 260,
    ...MODE_COLORS[mode],
    ...THEME_COLORS[themeName][mode],
  };
};

// 为主题预计算明暗版本
const createThemeVariants = (themeName: string) => ({
  light: createThemeConfig(themeName, false),
  dark: createThemeConfig(themeName, true),
});

const initialState = {
  themeName: "blue",
  isDark: false,
  // 预计算完整主题配置
  current: createThemeVariants("blue"),
  sidebarWidth: 260,
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
    },
  },
});

export const { setTheme, setSidebarWidth, setDarkMode } = themeSlice.actions;

// 简化的选择器 - 直接返回预计算的主题配置
export const selectTheme = (state) =>
  state.theme.isDark ? state.theme.current.dark : state.theme.current.light;

export const selectIsDark = (state) => state.theme.isDark;

export default themeSlice.reducer;
