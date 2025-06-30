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

// 1. 空间尺寸系统 - 优化为更精确的间距
export const SPACE = {
  0: "0",
  1: "4px", // 极小间距 - 精细控制
  2: "8px", // 小间距 - 图标间距
  3: "12px", // 中小间距 - 文本行距
  4: "16px", // 基础间距 - 标准模块间距
  5: "20px", // 中间距 - 小卡片间距
  6: "24px", // 中大间距 - 内容区间距
  7: "28px", // 新增 - 填补间隙
  8: "32px", // 大间距 - 区块间距
  10: "40px", // 极大间距 - 页面区域间距
  12: "48px", // 特大间距 - 大型组件间距
  14: "56px", // 新增 - 更大的间距选项
  16: "64px", // 巨大间距 - 页面级间距
  20: "80px", // 超大间距 - 顶级区域间距
  24: "96px", // 新增 - 超级间距
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

// 3. 明暗模式基础颜色 - 优化对比度和舒适度
export const MODE_COLORS = {
  light: {
    // 背景色系 - 更柔和的层次
    background: "#FFFFFF",
    backgroundSecondary: "#FAFBFC", // 更微妙的次级背景
    backgroundTertiary: "#F5F6F8", // 更清晰的三级背景
    backgroundGhost: "rgba(250, 251, 252, 0.95)", // 提高不透明度
    backgroundHover: "#F1F3F5", // 更明显的悬停态
    backgroundSelected: "#E8EBED", // 更清晰的选中态

    // 文本色系 - 优化对比度
    text: "#0D1117", // 更深的主文本
    textSecondary: "#24292F", // 更好的次级文本对比度
    textTertiary: "#57606A", // 优化的三级文本
    textQuaternary: "#8B949E", // 浅灰文本
    textLight: "#CDD5DF", // 极浅文本
    placeholder: "#8B949E", // 占位符文本

    // 边框色系 - 更精确的层次
    border: "#D8DEE4", // 主边框
    borderHover: "#BCC4CD", // 悬停边框
    borderLight: "#F1F3F5", // 轻边框

    // 状态颜色
    error: "#EF4444",

    // 阴影系统 - 更精确的阴影
    shadowLight: "rgba(31, 35, 40, 0.04)", // 轻阴影
    shadowMedium: "rgba(31, 35, 40, 0.08)", // 中阴影
    shadowHeavy: "rgba(31, 35, 40, 0.12)", // 重阴影

    // 内容区域背景
    messageBackground: "#FFFFFF",
    codeBackground: "#F6F8FA", // 更舒适的代码背景
  },
  dark: {
    // 背景色系 - 更深更舒适的层次
    background: "#0D1117", // 更深的主背景
    backgroundSecondary: "#161B22", // 更自然的次级背景
    backgroundTertiary: "#21262D", // 更清晰的三级背景
    backgroundGhost: "rgba(22, 27, 34, 0.95)", // 提高不透明度
    backgroundHover: "#262C36", // 更明显的悬停态
    backgroundSelected: "#2F3540", // 更清晰的选中态

    // 文本色系 - 更舒适的对比度
    text: "#F0F6FC", // 更柔和的主文本
    textSecondary: "#C9D1D9", // 优化的次级文本
    textTertiary: "#8B949E", // 平衡的三级文本
    textQuaternary: "#6E7681", // 更深的四级文本
    textLight: "#484F58", // 极深文本
    placeholder: "#6E7681", // 占位符文本

    // 边框色系 - 更清晰的夜间边框
    border: "#30363D", // 主边框
    borderHover: "#484F58", // 悬停边框
    borderLight: "#21262D", // 轻边框

    // 状态颜色
    error: "#F85149", // 夜间模式下的错误色

    // 阴影系统 - 更深的夜间阴影
    shadowLight: "rgba(1, 4, 9, 0.15)", // 轻阴影
    shadowMedium: "rgba(1, 4, 9, 0.25)", // 中阴影
    shadowHeavy: "rgba(1, 4, 9, 0.35)", // 重阴影

    // 内容区域背景
    messageBackground: "#161B22",
    codeBackground: "#0D1117", // 与主背景一致的代码背景
  },
};
