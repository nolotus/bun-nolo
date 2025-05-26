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

// 简化的空间尺寸系统
const SPACE = {
  0: "0",
  1: "4px", // 极小间距
  2: "8px", // 小间距
  3: "12px", // 中小间距
  4: "16px", // 基础间距
  5: "20px", // 中间距
  6: "24px", // 中大间距
  8: "32px", // 大间距
  10: "40px", // 极大间距
  12: "48px", // 特大间距
  16: "64px", // 巨大间距
  20: "80px", // 超大间距
};

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
    // 中性色系 - 适用于所有主题
    background: "#FFFFFF",
    backgroundSecondary: "#F9FAFB",
    backgroundTertiary: "#F3F4F6",
    backgroundGhost: "rgba(249, 250, 251, 0.97)",
    backgroundHover: "#F3F4F6",
    backgroundSelected: "#EAECF0",

    // 文本色系 - 微调为冷暖中性
    text: "#111827", // 接近黑色但带微弱蓝调
    textSecondary: "#374151", // 中深灰色
    textTertiary: "#6B7280", // 中灰色
    textQuaternary: "#9CA3AF", // 浅灰色
    textLight: "#D1D5DB", // 更浅的灰色
    placeholder: "#9CA3AF",

    // 边框系统 - 更加中性
    border: "#E5E7EB",
    borderHover: "#D1D5DB",
    borderLight: "#F3F4F6",

    // 状态颜色 - 保持不变
    error: "#EF4444",

    // 阴影系统
    shadowLight: "rgba(0, 0, 0, 0.05)",
    shadowMedium: "rgba(0, 0, 0, 0.07)",
    shadowHeavy: "rgba(0, 0, 0, 0.09)",
    shadow1: "rgba(0, 0, 0, 0.05)",
    shadow2: "rgba(0, 0, 0, 0.07)",
    shadow3: "rgba(0, 0, 0, 0.09)",

    // 内容区域背景 - 更加中性
    messageBackground: "#FFFFFF",
    codeBackground: "#F9FAFB",
  },
  dark: {
    // 基础背景系统 - 更加中性
    background: "#111827", // 深蓝灰色
    backgroundSecondary: "#1F2937", // 次级背景
    backgroundTertiary: "#374151", // 三级背景
    backgroundGhost: "rgba(31, 41, 55, 0.97)",
    backgroundHover: "#283547", // 悬停色
    backgroundSelected: "#374151", // 选中色

    // 文本色系 - 微调以减少与主题色冲突
    text: "#F9FAFB", // 几乎白色
    textSecondary: "#E5E7EB", // 浅灰白色
    textTertiary: "#9CA3AF", // 中灰色
    textQuaternary: "#6B7280", // 深灰色
    textLight: "#4B5563", // 更深的灰色
    placeholder: "#6B7280",

    // 边框系统 - 更精确的暗色边框
    border: "#374151",
    borderHover: "#4B5563",
    borderLight: "#1F2937",

    // 状态颜色 - 保持不变
    error: "#F87171",

    // 阴影系统 - 更深更明确
    shadowLight: "rgba(0, 0, 0, 0.2)",
    shadowMedium: "rgba(0, 0, 0, 0.25)",
    shadowHeavy: "rgba(0, 0, 0, 0.3)",
  },
};

// 创建完整主题配置
const createThemeConfig = (themeName: string, isDark: boolean) => {
  const mode = isDark ? "dark" : "light";
  return {
    sidebarWidth: 270,
    headerHeight: 48, // 新增顶部高度
    space: SPACE, // 添加精简的空间尺寸系统
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
  headerHeight: 48, // 新增顶部高度
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

    // 新增设置顶部高度的 reducer
    setHeaderHeight: (state, action) => {
      const height = action.payload;
      state.headerHeight = height;
      state.current.light.headerHeight = height;
      state.current.dark.headerHeight = height;
    },
  },
});

export const { setTheme, setSidebarWidth, setDarkMode, setHeaderHeight } =
  themeSlice.actions;

// 简化的选择器 - 直接返回预计算的主题配置
export const selectTheme = (state) =>
  state.theme.isDark ? state.theme.current.dark : state.theme.current.light;

export const selectIsDark = (state) => state.theme.isDark;

// 新增选择器用于获取顶部高度
export const selectHeaderHeight = (state) => state.theme.headerHeight;

export default themeSlice.reducer;
