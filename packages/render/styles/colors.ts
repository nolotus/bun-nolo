// render/styles/colors.ts
import { blue } from "app/theme/blue";
import { green } from "app/theme/green";
import { purple } from "app/theme/purple";
import { pink } from "app/theme/pink";
import { yellow } from "app/theme/yellow";
import { red } from "app/theme/red";
import { orange } from "app/theme/orange";
import { graphite } from "app/theme/graphite";

const BASE_COLORS = {
  light: {
    // 主色调相关
    primary: "#0062ff",
    primaryLight: "#33ccff",
    primaryGhost: "rgba(0, 98, 255, 0.1)",
    primaryGradient: "linear-gradient(45deg, #0062ff, #33ccff)",

    // 背景色相关
    background: "#FFFFFF",
    backgroundSecondary: "#F9FAFB",
    backgroundGhost: "rgba(255, 255, 255, 0.9)",

    // 文本色相关
    text: "#111827",
    textSecondary: "#4B5563",
    textTertiary: "#666666",
    textLight: "#888888",
    placeholder: "#9CA3AF",

    // 边框相关
    border: "#E5E7EB",
    borderHover: "#D1D5DB",
    borderLight: "rgba(255, 255, 255, 0.3)",

    // 状态相关
    error: "#ef4444",

    // 阴影相关
    shadowLight: "rgba(0,0,0,0.06)",
    shadowMedium: "rgba(0,0,0,0.08)",
    shadowHeavy: "rgba(0,0,0,0.1)",

    // 特殊用途
    dropZoneActive: "rgba(0, 98, 255, 0.08)",
  },
  dark: {
    // 主色调相关
    primary: "#33ccff",
    primaryLight: "#0062ff",
    primaryGhost: "rgba(51, 204, 255, 0.1)",
    primaryGradient: "linear-gradient(45deg, #33ccff, #0062ff)",

    // 背景色相关
    background: "#1A1A1A",
    backgroundSecondary: "#262626",
    backgroundGhost: "rgba(26, 26, 26, 0.9)",

    // 文本色相关
    text: "#FFFFFF",
    textSecondary: "#A3A3A3",
    textTertiary: "#8C8C8C",
    textLight: "#666666",
    placeholder: "#595959",

    // 边框相关
    border: "#333333",
    borderHover: "#404040",
    borderLight: "rgba(26, 26, 26, 0.3)",

    // 图标
    icon: "#A3A3A3",

    // 状态相关
    error: "#ff4d4f",

    // 阴影相关
    shadowLight: "rgba(0,0,0,0.15)",
    shadowMedium: "rgba(0,0,0,0.2)",
    shadowHeavy: "rgba(0,0,0,0.25)",

    // 特殊用途
    dropZoneActive: "rgba(51, 204, 255, 0.08)",
  },
};

export const themes = {
  blue,
  green,
  purple,
  pink,
  yellow,
  red,
  orange,
  graphite,
};

export const mergedThemes = Object.keys(themes).reduce((acc, themeKey) => {
  acc[themeKey] = {
    light: {
      ...BASE_COLORS.light,
      ...themes[themeKey].light,
    },
    dark: {
      ...BASE_COLORS.dark,
      ...themes[themeKey].dark,
    },
  };
  return acc;
}, {});

export const defaultTheme = mergedThemes.red.light;
