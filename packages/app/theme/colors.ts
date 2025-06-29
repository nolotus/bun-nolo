// app/theme/colors.ts

export const blue = {
  light: {
    primary: "#1677FF",
    primaryLight: "#4096FF",
    primaryBg: "#F0F7FF",
    hover: "#0958D9",
    focus: "rgba(22, 119, 255, 0.12)",
    primaryGhost: "rgba(22, 119, 255, 0.08)",
    primaryGradient: "linear-gradient(45deg, #1677FF, #4096FF)",
    name: "默认蓝",
    primaryDark: "#0958D9",
    primaryHover: "rgba(22, 119, 255, 0.12)",

    // 扩展色彩系统 - 蓝色协调色
    backgroundAccent: "#F0F7FF", // 带蓝色调的浅背景
    backgroundActive: "#E6F4FF", // 稍强的蓝色背景
    borderAccent: "#BAE0FF", // 带蓝色的边框
    success: "#10B981", // 协调的绿色
    warning: "#F59E0B", // 协调的橙色
    info: "#1677FF", // 信息色使用主色
  },
  dark: {
    primary: "#4096FF",
    primaryLight: "#69B1FF",
    primaryBg: "#111A2C",
    hover: "#1677FF",
    focus: "rgba(64, 150, 255, 0.12)",
    primaryGhost: "rgba(64, 150, 255, 0.1)",
    primaryGradient: "linear-gradient(45deg, #4096FF, #69B1FF)",
    name: "默认蓝(暗色)",
    primaryDark: "#1677FF",
    primaryHover: "rgba(64, 150, 255, 0.12)",

    // 扩展色彩系统 - 暗色模式下的蓝色协调色
    backgroundAccent: "#112240", // 带蓝色调的深背景
    backgroundActive: "#112D56", // 稍强的蓝色背景
    borderAccent: "#1D4ED8", // 带蓝色的暗边框
    success: "#10B981", // 协调的绿色
    warning: "#F59E0B", // 协调的橙色
    info: "#4096FF", // 信息色使用主色
  },
};
export const green = {
  light: {
    primary: "#10B981", // 清新的翡翠绿
    primaryLight: "#34D399", // 较浅的绿色
    primaryBg: "#ECFDF5", // 极浅的背景绿
    hover: "#059669", // 深绿交互色
    focus: "rgba(16, 185, 129, 0.12)",
    primaryGhost: "rgba(16, 185, 129, 0.08)", // 微调透明度
    primaryGradient: "linear-gradient(45deg, #10B981, #34D399)",
    name: "清新绿",
    primaryDark: "#059669", // 与hover保持一致
    primaryHover: "rgba(16, 185, 129, 0.12)", // 与focus保持一致
  },
  dark: {
    primary: "#34D399", // 明亮的绿色
    primaryLight: "#6EE7B7", // 更亮的薄荷绿
    primaryBg: "#0F1922", // 带绿调的深色背景
    hover: "#10B981", // 互补的悬停色
    focus: "rgba(52, 211, 153, 0.12)",
    primaryGhost: "rgba(52, 211, 153, 0.1)",
    primaryGradient: "linear-gradient(45deg, #34D399, #6EE7B7)",
    name: "清新绿(暗色)",
    primaryDark: "#10B981", // 与hover保持一致
    primaryHover: "rgba(52, 211, 153, 0.12)", // 与focus保持一致
  },
};
export const graphite = {
  light: {
    primary: "#475569", // 优雅的石墨灰
    primaryLight: "#64748B", // 较浅的石墨色
    primaryBg: "#F8FAFC", // 极浅的背景灰
    hover: "#334155", // 深灰交互色
    focus: "rgba(71, 85, 105, 0.12)",
    primaryGhost: "rgba(71, 85, 105, 0.08)", // 微调透明度
    primaryGradient: "linear-gradient(45deg, #475569, #64748B)",
    name: "石墨灰",
    primaryDark: "#334155", // 与hover保持一致
    primaryHover: "rgba(71, 85, 105, 0.12)", // 与focus保持一致
  },
  dark: {
    primary: "#94A3B8", // 明亮的石墨色
    primaryLight: "#CBD5E1", // 更亮的灰色
    primaryBg: "#0F172A", // 深色背景
    hover: "#64748B", // 互补的悬停色
    focus: "rgba(148, 163, 184, 0.12)",
    primaryGhost: "rgba(148, 163, 184, 0.1)",
    primaryGradient: "linear-gradient(45deg, #94A3B8, #CBD5E1)",
    name: "石墨灰(暗色)",
    primaryDark: "#64748B", // 与hover保持一致
    primaryHover: "rgba(148, 163, 184, 0.12)", // 与focus保持一致
  },
};
export const orange = {
  light: {
    primary: "#F97316",
    primaryLight: "#FB923C",
    primaryBg: "#FFF7ED",
    hover: "#EA580C",
    focus: "rgba(249, 115, 22, 0.12)",
    primaryGhost: "rgba(249, 115, 22, 0.08)",
    primaryGradient: "linear-gradient(45deg, #F97316, #FB923C)",
    name: "暖橙",
    primaryDark: "#EA580C",
    primaryHover: "rgba(249, 115, 22, 0.12)",

    // 扩展色彩系统 - 橙色协调色
    backgroundAccent: "#FFF7ED", // 带橙色调的浅背景
    backgroundActive: "#FFEDD5", // 稍强的橙色背景
    borderAccent: "#FED7AA", // 带橙色的边框
    success: "#059669", // 深绿色，与橙色协调
    warning: "#F97316", // 警告色使用主色
    info: "#3B82F6", // 协调的蓝色
  },
  dark: {
    primary: "#FB923C",
    primaryLight: "#FDBA74",
    primaryBg: "#1C1917",
    hover: "#F97316",
    focus: "rgba(251, 146, 60, 0.12)",
    primaryGhost: "rgba(251, 146, 60, 0.1)",
    primaryGradient: "linear-gradient(45deg, #FB923C, #FDBA74)",
    name: "暖橙(暗色)",
    primaryDark: "#F97316",
    primaryHover: "rgba(251, 146, 60, 0.12)",

    // 扩展色彩系统 - 暗色模式下的橙色协调色
    backgroundAccent: "#292524", // 带暖调的深背景
    backgroundActive: "#2E2320", // 稍强的橙色调背景
    borderAccent: "#C2410C", // 带橙色的暗边框
    success: "#10B981", // 协调的绿色
    warning: "#FB923C", // 警告色使用主色
    info: "#60A5FA", // 协调的蓝色
  },
};
export const pink = {
  light: {
    primary: "#db2777",
    primaryLight: "#f17eae",
    primaryBg: "#fef1f7",
    hover: "#c32069",
    focus: "rgba(219, 39, 119, 0.12)",
    primaryGhost: "rgba(219, 39, 119, 0.1)",
    primaryGradient: "linear-gradient(45deg, #db2777, #f17eae)",
    name: "温柔粉",
  },
  dark: {
    primary: "#f17eae",
    primaryLight: "#db2777",
    primaryBg: "#2a1922",
    hover: "#f591bb",
    focus: "rgba(241, 126, 174, 0.12)",
    primaryGhost: "rgba(241, 126, 174, 0.1)",
    primaryGradient: "linear-gradient(45deg, #f17eae, #f591bb)",
    name: "温柔粉(暗色)",
  },
};
export const purple = {
  light: {
    primary: "#722ED1", // 优雅的紫色
    primaryLight: "#9254DE", // 浅紫色
    primaryBg: "#F9F0FF", // 柔和的背景紫
    hover: "#531DAB", // 深紫交互色
    focus: "rgba(114, 46, 209, 0.12)",
    primaryGhost: "rgba(114, 46, 209, 0.08)", // 轻微调整透明度
    primaryGradient: "linear-gradient(45deg, #722ED1, #9254DE)",
    name: "雅致紫",
    primaryDark: "#531DAB", // 与hover保持一致
    primaryHover: "rgba(114, 46, 209, 0.12)", // 与focus保持一致
  },
  dark: {
    primary: "#9254DE", // 鲜明紫色
    primaryLight: "#B37FEB", // 亮紫色
    primaryBg: "#1A1429", // 深紫背景
    hover: "#722ED1", // 互补的悬停色
    focus: "rgba(146, 84, 222, 0.12)",
    primaryGhost: "rgba(146, 84, 222, 0.1)",
    primaryGradient: "linear-gradient(45deg, #9254DE, #B37FEB)",
    name: "雅致紫(暗色)",
    primaryDark: "#722ED1", // 与hover保持一致
    primaryHover: "rgba(146, 84, 222, 0.12)", // 与focus保持一致
  },
};
export const red = {
  light: {
    primary: "#EF4444", // 鲜明但不刺眼的红色
    primaryLight: "#F87171", // 较浅的红色
    primaryBg: "#FEF2F2", // 极浅的背景粉红
    hover: "#DC2626", // 深红交互色
    focus: "rgba(239, 68, 68, 0.12)",
    primaryGhost: "rgba(239, 68, 68, 0.08)", // 微调透明度
    primaryGradient: "linear-gradient(45deg, #EF4444, #F87171)",
    name: "典雅红",
    primaryDark: "#DC2626", // 与hover保持一致
    primaryHover: "rgba(239, 68, 68, 0.12)", // 与focus保持一致
  },
  dark: {
    primary: "#F87171", // 明亮的红色
    primaryLight: "#FCA5A5", // 更柔和的浅红色
    primaryBg: "#1C1917", // 带暖调的深色背景
    hover: "#EF4444", // 互补的悬停色
    focus: "rgba(248, 113, 113, 0.12)",
    primaryGhost: "rgba(248, 113, 113, 0.1)",
    primaryGradient: "linear-gradient(45deg, #F87171, #FCA5A5)",
    name: "典雅红(暗色)",
    primaryDark: "#EF4444", // 与hover保持一致
    primaryHover: "rgba(248, 113, 113, 0.12)", // 与focus保持一致
  },
};
export const yellow = {
  light: {
    primary: "#F7C52B", // 更纯正的黄色,降低红色成分
    primaryLight: "#FFD95A", // 更明亮的黄色
    primaryBg: "#FFFBEB", // 更柔和的背景色
    hover: "#E6B622", // 降低饱和度的hover状态
    focus: "rgba(247, 197, 43, 0.12)",
    primaryGhost: "rgba(247, 197, 43, 0.1)",
    primaryGradient: "linear-gradient(45deg, #F7C52B, #FFD95A)",
    name: "明亮黄",
  },
  dark: {
    primary: "#FFD95A", // 暗色模式下使用更亮的黄色
    primaryLight: "#F7C52B",
    primaryBg: "#2A2620", // 暖色调的深色背景
    hover: "#FFE070", // 柔和的hover效果
    focus: "rgba(255, 217, 90, 0.12)",
    primaryGhost: "rgba(255, 217, 90, 0.1)",
    primaryGradient: "linear-gradient(45deg, #FFD95A, #FFE070)",
    name: "明亮黄(暗色)",
  },
};
