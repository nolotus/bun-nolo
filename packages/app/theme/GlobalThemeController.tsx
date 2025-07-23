// app/theme/GlobalThemeController.tsx

import { useAppSelector } from "app/store";
import { selectTheme } from "app/settings/settingSlice";

const STYLE_TAG_ID = "global-theme-variables";

/**
 * 递归地将 JavaScript 主题对象转换为 CSS 自定义属性 (CSS 变量) 字符串数组。
 * @param themeObject - 主题对象，可以包含嵌套对象。
 * @param prefix - 用于递归时生成变量名的前缀 (例如 "space")。
 * @returns 一个包含所有 CSS 变量定义的字符串数组。
 */
const generateCssVariables = (
  themeObject: Record<string, any>,
  prefix = ""
): string[] => {
  return Object.entries(themeObject).flatMap(([key, value]) => {
    const newKey = prefix ? `${prefix}-${key}` : key;

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      return generateCssVariables(value, newKey);
    }
    if (value !== null && value !== undefined) {
      return [`--${newKey}:${value};`];
    }
    return [];
  });
};

/**
 * 将完整的、可能包含嵌套的主题对象转换为最终的 CSS 字符串。
 * @param theme - 从 selectTheme selector 返回的完整主题对象。
 * @returns 一个完整的 CSS :root 规则字符串。
 */
const generateCssString = (theme: Record<string, any>): string => {
  const variables = generateCssVariables(theme).join(" ");
  return `:root { ${variables} }`;
};

/**
 * 全局主题控制器 (React 19+ 版本)。
 * 它的职责是声明式地渲染一个 <style> 标签。
 * 在服务端 (SSR)，React 19 会自动将此标签提升到 HTML <head>。
 * 在客户端，React 会接管此标签，并在主题变化时高效地更新它。
 * 这移除了所有手动的 DOM 操作。
 */
const GlobalThemeController = () => {
  // 1. 在服务端和客户端都能从 Redux store 获取到主题状态
  const theme = useAppSelector(selectTheme);

  // 2. 根据当前主题状态生成 CSS 变量字符串
  const cssString = generateCssString(theme);

  // 3. 直接渲染 <style> 标签。React 19 会处理剩下的一切。
  //    我们甚至不需要导出 generateCssString 了，因为它只在这里使用。
  return <style id={STYLE_TAG_ID}>{cssString}</style>;
};

export default GlobalThemeController;
