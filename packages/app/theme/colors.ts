// app/theme/colors.ts

export const blue = {
  light: {
    primary: "#1677FF",
    primaryLight: "#4096FF",
    primaryBg: "#F6FBFF",
    hover: "#0958D9",
    focus: "rgba(22, 119, 255, 0.10)",
    primaryGhost: "rgba(22, 119, 255, 0.06)",
    primaryGradient: "linear-gradient(135deg, #1677FF, #4096FF)",
    name: "默认蓝",
    primaryDark: "#0958D9",
    primaryHover: "rgba(22, 119, 255, 0.10)",

    // 扩展色彩系统 - 蓝色协调色
    backgroundAccent: "#F6FBFF", // 更微妙的蓝色调背景
    backgroundActive: "#E8F4FF", // 稍强的蓝色背景
    borderAccent: "#C7E2FF", // 柔和的蓝色边框
    success: "#10B981",
    warning: "#F59E0B",
    info: "#1677FF",
  },
  dark: {
    primary: "#4096FF",
    primaryLight: "#69B1FF",
    primaryBg: "#0F1419",
    hover: "#1677FF",
    focus: "rgba(64, 150, 255, 0.15)",
    primaryGhost: "rgba(64, 150, 255, 0.08)",
    primaryGradient: "linear-gradient(135deg, #4096FF, #69B1FF)",
    name: "默认蓝(暗色)",
    primaryDark: "#1677FF",
    primaryHover: "rgba(64, 150, 255, 0.15)",

    // 扩展色彩系统 - 暗色模式下的蓝色协调色
    backgroundAccent: "#0A1220", // 更深的蓝调背景
    backgroundActive: "#0F1829", // 稍强的蓝色背景
    borderAccent: "#1E3A8A", // 深蓝边框
    success: "#10B981",
    warning: "#F59E0B",
    info: "#4096FF",
  },
};

export const green = {
  light: {
    primary: "#10B981",
    primaryLight: "#34D399",
    primaryBg: "#F0FDF9",
    hover: "#059669",
    focus: "rgba(16, 185, 129, 0.10)",
    primaryGhost: "rgba(16, 185, 129, 0.06)",
    primaryGradient: "linear-gradient(135deg, #10B981, #34D399)",
    name: "清新绿",
    primaryDark: "#059669",
    primaryHover: "rgba(16, 185, 129, 0.10)",

    backgroundAccent: "#F0FDF9",
    backgroundActive: "#E6FFF7",
    borderAccent: "#A7F3D0",
    success: "#10B981",
    warning: "#F59E0B",
    info: "#3B82F6",
  },
  dark: {
    primary: "#34D399",
    primaryLight: "#6EE7B7",
    primaryBg: "#0C1B14",
    hover: "#10B981",
    focus: "rgba(52, 211, 153, 0.15)",
    primaryGhost: "rgba(52, 211, 153, 0.08)",
    primaryGradient: "linear-gradient(135deg, #34D399, #6EE7B7)",
    name: "清新绿(暗色)",
    primaryDark: "#10B981",
    primaryHover: "rgba(52, 211, 153, 0.15)",

    backgroundAccent: "#051B11",
    backgroundActive: "#0A2318",
    borderAccent: "#065F46",
    success: "#34D399",
    warning: "#F59E0B",
    info: "#60A5FA",
  },
};

export const graphite = {
  light: {
    primary: "#475569",
    primaryLight: "#64748B",
    primaryBg: "#F8FAFC",
    hover: "#334155",
    focus: "rgba(71, 85, 105, 0.10)",
    primaryGhost: "rgba(71, 85, 105, 0.06)",
    primaryGradient: "linear-gradient(135deg, #475569, #64748B)",
    name: "石墨灰",
    primaryDark: "#334155",
    primaryHover: "rgba(71, 85, 105, 0.10)",

    backgroundAccent: "#F8FAFC",
    backgroundActive: "#F1F5F9",
    borderAccent: "#CBD5E1",
    success: "#10B981",
    warning: "#F59E0B",
    info: "#3B82F6",
  },
  dark: {
    primary: "#94A3B8",
    primaryLight: "#CBD5E1",
    primaryBg: "#0F1419",
    hover: "#64748B",
    focus: "rgba(148, 163, 184, 0.15)",
    primaryGhost: "rgba(148, 163, 184, 0.08)",
    primaryGradient: "linear-gradient(135deg, #94A3B8, #CBD5E1)",
    name: "石墨灰(暗色)",
    primaryDark: "#64748B",
    primaryHover: "rgba(148, 163, 184, 0.15)",

    backgroundAccent: "#0C1116",
    backgroundActive: "#161B22",
    borderAccent: "#374151",
    success: "#10B981",
    warning: "#F59E0B",
    info: "#60A5FA",
  },
};

export const orange = {
  light: {
    primary: "#F56E0F", // 使用配色板中的 Liquid Lava
    primaryLight: "#FF8A3D", // 稍微亮一些的橙色
    primaryBg: "#FBFBFB", // 使用配色板中的 Snow 作为浅色背景
    hover: "#E5620D", // 比主色稍深的悬停色
    focus: "rgba(245, 110, 15, 0.10)",
    primaryGhost: "rgba(245, 110, 15, 0.06)",
    primaryGradient: "linear-gradient(135deg, #F56E0F, #FF8A3D)",
    name: "熔岩橙",
    primaryDark: "#E5620D",
    primaryHover: "rgba(245, 110, 15, 0.10)",

    backgroundAccent: "#FBFBFB", // Snow
    backgroundActive: "#F5F5F5",
    borderAccent: "#878787", // 使用配色板中的 Dusty Grey
    success: "#059669",
    warning: "#F56E0F",
    info: "#3B82F6",
  },
  dark: {
    primary: "#F56E0F", // 保持 Liquid Lava 作为主色
    primaryLight: "#FF8A3D",
    primaryBg: "#151419", // 使用配色板中的 Dark Void
    hover: "#FF8A3D",
    focus: "rgba(245, 110, 15, 0.15)",
    primaryGhost: "rgba(245, 110, 15, 0.08)",
    primaryGradient: "linear-gradient(135deg, #F56E0F, #FF8A3D)",
    name: "熔岩橙(暗色)",
    primaryDark: "#E5620D",
    primaryHover: "rgba(245, 110, 15, 0.15)",

    backgroundAccent: "#1B1B1E", // 使用配色板中的 Gluon Grey
    backgroundActive: "#262626", // 使用配色板中的 Slate Grey
    borderAccent: "#878787", // 使用配色板中的 Dusty Grey
    success: "#10B981",
    warning: "#F56E0F",
    info: "#60A5FA",
  },
};
export const yellow = {
  light: {
    primary: "#D97706", // 从 #EAB308 调整为更柔和的琥珀色
    primaryLight: "#F59E0B", // 从 #FCD34D 调整为中等亮度的黄色
    primaryBg: "#FFFBEB", // 从 #FFFCF0 调整为更柔和的奶黄背景
    hover: "#B45309", // 从 #CA8A04 调整为更深的褐黄色
    focus: "rgba(217, 119, 6, 0.10)", // 更新为新的主色透明度
    primaryGhost: "rgba(217, 119, 6, 0.06)", // 更新为新的主色透明度
    primaryGradient: "linear-gradient(135deg, #D97706, #F59E0B)", // 更新渐变色
    name: "明亮黄",
    primaryDark: "#B45309",
    primaryHover: "rgba(217, 119, 6, 0.10)",

    backgroundAccent: "#FFFBEB", // 与 primaryBg 保持一致
    backgroundActive: "#FEF3C7", // 从 #FEF9E7 调整为更柔和的激活背景
    borderAccent: "#FDE68A", // 保持柔和的黄色边框
    success: "#10B981",
    warning: "#D97706", // 与主色保持一致
    info: "#3B82F6",
  },
  dark: {
    primary: "#F59E0B", // 从 #FCD34D 调整为中等亮度，避免过于刺眼
    primaryLight: "#FBBF24", // 从 #FDE68A 调整为稍微亮一些但不刺眼的黄色
    primaryBg: "#1C1917", // 从 #1C1A10 调整为更深的暖色调背景
    hover: "#D97706", // 从 #FBBF24 调整为更深的黄色
    focus: "rgba(245, 158, 11, 0.15)", // 更新为新的主色透明度
    primaryGhost: "rgba(245, 158, 11, 0.08)", // 更新为新的主色透明度
    primaryGradient: "linear-gradient(135deg, #F59E0B, #FBBF24)", // 更新渐变色
    name: "明亮黄(暗色)",
    primaryDark: "#D97706",
    primaryHover: "rgba(245, 158, 11, 0.15)",

    backgroundAccent: "#1C1917", // 与 primaryBg 保持一致
    backgroundActive: "#292524", // 从 #221E14 调整为更深的暖灰色
    borderAccent: "#A16207", // 从 #B45309 调整为稍微亮一些的边框色
    success: "#10B981",
    warning: "#F59E0B", // 与主色保持一致
    info: "#60A5FA",
  },
};

export const pink = {
  light: {
    primary: "#EC4899",
    primaryLight: "#F472B6",
    primaryBg: "#FDF2F8",
    hover: "#DB2777",
    focus: "rgba(236, 72, 153, 0.10)",
    primaryGhost: "rgba(236, 72, 153, 0.06)",
    primaryGradient: "linear-gradient(135deg, #EC4899, #F472B6)",
    name: "温柔粉",
    primaryDark: "#DB2777",
    primaryHover: "rgba(236, 72, 153, 0.10)",

    backgroundAccent: "#FDF2F8",
    backgroundActive: "#FCE8F3",
    borderAccent: "#F9A8D4",
    success: "#10B981",
    warning: "#F59E0B",
    info: "#3B82F6",
  },
  dark: {
    primary: "#F472B6",
    primaryLight: "#F9A8D4",
    primaryBg: "#1C1118",
    hover: "#EC4899",
    focus: "rgba(244, 114, 182, 0.15)",
    primaryGhost: "rgba(244, 114, 182, 0.08)",
    primaryGradient: "linear-gradient(135deg, #F472B6, #F9A8D4)",
    name: "温柔粉(暗色)",
    primaryDark: "#EC4899",
    primaryHover: "rgba(244, 114, 182, 0.15)",

    backgroundAccent: "#1A0F15",
    backgroundActive: "#22141B",
    borderAccent: "#BE185D",
    success: "#10B981",
    warning: "#F59E0B",
    info: "#60A5FA",
  },
};

export const purple = {
  light: {
    primary: "#8B5CF6",
    primaryLight: "#A78BFA",
    primaryBg: "#FAF7FF",
    hover: "#7C3AED",
    focus: "rgba(139, 92, 246, 0.10)",
    primaryGhost: "rgba(139, 92, 246, 0.06)",
    primaryGradient: "linear-gradient(135deg, #8B5CF6, #A78BFA)",
    name: "雅致紫",
    primaryDark: "#7C3AED",
    primaryHover: "rgba(139, 92, 246, 0.10)",

    backgroundAccent: "#FAF7FF",
    backgroundActive: "#F5F0FF",
    borderAccent: "#C7D2FE",
    success: "#10B981",
    warning: "#F59E0B",
    info: "#3B82F6",
  },
  dark: {
    primary: "#A78BFA",
    primaryLight: "#C4B5FD",
    primaryBg: "#15111C",
    hover: "#8B5CF6",
    focus: "rgba(167, 139, 250, 0.15)",
    primaryGhost: "rgba(167, 139, 250, 0.08)",
    primaryGradient: "linear-gradient(135deg, #A78BFA, #C4B5FD)",
    name: "雅致紫(暗色)",
    primaryDark: "#8B5CF6",
    primaryHover: "rgba(167, 139, 250, 0.15)",

    backgroundAccent: "#130F1A",
    backgroundActive: "#1B1520",
    borderAccent: "#6D28D9",
    success: "#10B981",
    warning: "#F59E0B",
    info: "#60A5FA",
  },
};

export const red = {
  light: {
    primary: "#EF4444",
    primaryLight: "#F87171",
    primaryBg: "#FEF7F7",
    hover: "#DC2626",
    focus: "rgba(239, 68, 68, 0.10)",
    primaryGhost: "rgba(239, 68, 68, 0.06)",
    primaryGradient: "linear-gradient(135deg, #EF4444, #F87171)",
    name: "典雅红",
    primaryDark: "#DC2626",
    primaryHover: "rgba(239, 68, 68, 0.10)",

    backgroundAccent: "#FEF7F7",
    backgroundActive: "#FEF1F1",
    borderAccent: "#FCA5A5",
    success: "#10B981",
    warning: "#F59E0B",
    info: "#3B82F6",
  },
  dark: {
    primary: "#F87171",
    primaryLight: "#FCA5A5",
    primaryBg: "#1C1112",
    hover: "#EF4444",
    focus: "rgba(248, 113, 113, 0.15)",
    primaryGhost: "rgba(248, 113, 113, 0.08)",
    primaryGradient: "linear-gradient(135deg, #F87171, #FCA5A5)",
    name: "典雅红(暗色)",
    primaryDark: "#EF4444",
    primaryHover: "rgba(248, 113, 113, 0.15)",

    backgroundAccent: "#1A0F11",
    backgroundActive: "#221416",
    borderAccent: "#DC2626",
    success: "#10B981",
    warning: "#F59E0B",
    info: "#60A5FA",
  },
};
