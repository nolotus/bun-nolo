import {
  blue,
  purple,
  green,
  orange,
  yellow,
  graphite,
  pink,
  red,
} from "./colors"; // 确保此路径指向你的颜色定义文件

/**
 * 包含所有静态主题配置，包括间距、主题色、基础模式颜色。
 * 这些常量被 settingSlice 用来动态构建当前主题。
 */

// 1. 空间尺寸系统
export const SPACE = {
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

// 2. 主题色系配置
export const THEME_COLORS = {
  blue,
  purple,
  green,
  orange,
  red,
  yellow,
  graphite,
  pink,
};

// 3. 明暗模式基础颜色
export const MODE_COLORS = {
  light: {
    background: "#FFFFFF",
    backgroundSecondary: "#F9FAFB",
    backgroundTertiary: "#F3F4F6",
    backgroundGhost: "rgba(249, 250, 251, 0.97)",
    backgroundHover: "#F3F4F6",
    backgroundSelected: "#EAECF0",
    text: "#111827",
    textSecondary: "#374151",
    textTertiary: "#6B7280",
    textQuaternary: "#9CA3AF",
    textLight: "#D1D5DB",
    placeholder: "#9CA3AF",
    border: "#E5E7EB",
    borderHover: "#D1D5DB",
    borderLight: "#F3F4F6",
    error: "#EF4444",
    shadowLight: "rgba(0, 0, 0, 0.05)",
    shadowMedium: "rgba(0, 0, 0, 0.07)",
    shadowHeavy: "rgba(0, 0, 0, 0.09)",
    messageBackground: "#FFFFFF",
    codeBackground: "#F9FAFB",
  },
  dark: {
    background: "#111827",
    backgroundSecondary: "#1F2937",
    backgroundTertiary: "#374151",
    backgroundGhost: "rgba(31, 41, 55, 0.97)",
    backgroundHover: "#283547",
    backgroundSelected: "#374151",
    text: "#F9FAFB",
    textSecondary: "#E5E7EB",
    textTertiary: "#9CA3AF",
    textQuaternary: "#6B7280",
    textLight: "#4B5563",
    placeholder: "#6B7280",
    border: "#374151",
    borderHover: "#4B5563",
    borderLight: "#1F2937",
    error: "#F87171",
    shadowLight: "rgba(0, 0, 0, 0.2)",
    shadowMedium: "rgba(0, 0, 0, 0.25)",
    shadowHeavy: "rgba(0, 0, 0, 0.3)",
  },
};
