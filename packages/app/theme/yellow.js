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
