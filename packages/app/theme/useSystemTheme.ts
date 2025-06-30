// src/hooks/useSystemTheme.ts

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "app/store"; // 假设您有标准的类型化 hooks
import {
  setSettings,
  selectThemeFollowsSystem,
  selectIsDark,
} from "app/settings/settingSlice"; // 根据您的项目结构调整路径

/**
 * 一个自定义 React Hook，用于在用户启用“跟随系统主题”时，
 * 自动同步应用的亮/暗模式。
 */
export const useSystemTheme = (): void => {
  const dispatch = useAppDispatch();
  const themeFollowsSystem = useAppSelector(selectThemeFollowsSystem);
  const isDarkInState = useAppSelector(selectIsDark);

  useEffect(() => {
    // 如果用户未开启“跟随系统主题”，则不执行任何操作。
    if (!themeFollowsSystem) {
      return;
    }

    // 使用浏览器 API 检查系统是否处于暗色模式。
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    // **步骤 1: 初始同步**
    // 当 `themeFollowsSystem` 设置为 true 时，立即检查并同步当前系统主题。
    // 这可以确保在启用设置的瞬间，应用主题就与系统保持一致。
    const systemIsDark = mediaQuery.matches;
    if (systemIsDark !== isDarkInState) {
      // 使用 `setSettings` 而非 `changeDarkMode`，
      // 因为 `changeDarkMode` 会将 `themeFollowsSystem` 设为 false，
      // 而我们在这里希望保持其为 true。
      dispatch(setSettings({ isDark: systemIsDark }));
    }

    // **步骤 2: 添加监听器**
    // 监听系统主题的实时变化。
    const handleChange = (event: MediaQueryListEvent) => {
      dispatch(setSettings({ isDark: event.matches }));
    };

    mediaQuery.addEventListener("change", handleChange);

    // **步骤 3: 清理副作用**
    // 当组件卸载或 `themeFollowsSystem` 变为 false 时，
    // 移除事件监听器，防止内存泄漏和不必要的更新。
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };

    // 依赖项数组确保 effect 仅在关键状态变化时重新运行。
  }, [themeFollowsSystem, isDarkInState, dispatch]);
};
