// app/theme/GlobalThemeController.tsx

import { useEffect } from "react";
import { useAppSelector } from "app/store";
import { selectTheme } from "app/settings/settingSlice";

const STYLE_TAG_ID = "global-theme-variables";

/**
 * 递归地将 JavaScript 主题对象转换为 CSS 自定义属性 (CSS 变量) 字符串数组。
 * @param themeObject - 主题对象，可以包含嵌套对象。
 * @param prefix - 用于递归时生成变量名的前缀 (例如 "space")。
 * @returns 一个包含所有 CSS 变量定义的字符串数组，例如 ["--primary:#1677FF;", "--space-4:16px;"]。
 */
const generateCssVariables = (
  themeObject: Record<string, any>,
  prefix = ""
): string[] => {
  return Object.entries(themeObject).flatMap(([key, value]) => {
    const newKey = prefix ? `${prefix}-${key}` : key;

    // 如果值是对象且不为 null/数组，则递归处理
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      return generateCssVariables(value, newKey);
    }
    // 如果是有效的基础类型值，则创建 CSS 变量
    if (value !== null && value !== undefined) {
      return [`--${newKey}:${value};`];
    }
    // 忽略 null 或 undefined 的值
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
 * 全局主题控制器 (无头组件)。
 * 它的唯一职责是：通过副作用(useEffect)来管理文档 <head> 中的一个 <style> 标签，
 * 以此将 Redux 中的动态主题应用为全局 CSS 变量。
 */
const GlobalThemeController = () => {
  const theme = useAppSelector(selectTheme);

  useEffect(() => {
    const cssString = generateCssString(theme);
    let styleTag = document.getElementById(STYLE_TAG_ID);

    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = STYLE_TAG_ID;
      document.head.appendChild(styleTag);
    }

    // 只有当内容实际发生变化时才更新，以减少不必要的 DOM 操作
    if (styleTag.innerHTML !== cssString) {
      styleTag.innerHTML = cssString;
    }

    return () => {
      const tagToRemove = document.getElementById(STYLE_TAG_ID);
      if (tagToRemove) {
        document.head.removeChild(tagToRemove);
      }
    };
  }, [theme]);

  return null;
};

export default GlobalThemeController;
