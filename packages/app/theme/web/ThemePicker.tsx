import React from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "app/store";
// 从合并后的 settingSlice 中导入新的 action 和 selectors
import {
  changeTheme,
  selectTheme,
  selectThemeName,
} from "app/settings/settingSlice";
import { CheckCircleFillIcon } from "@primer/octicons-react";
// 确保颜色导入路径正确
import * as themePalettes from "app/theme/colors";

// 动态生成可用的主题列表，保持与 colors.ts 同步
const availableThemes = Object.entries(themePalettes).map(([key, palette]) => ({
  value: key, // 'blue', 'green', etc.
  color: palette.light.primary, // 使用 light 模式下的主色作为预览色
  name: palette.light.name, // 使用 light 模式下的名称作为显示名
}));

export const ThemePicker: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // 使用新的 selectors 获取所需状态
  const theme = useAppSelector(selectTheme); // 获取完整的主题对象，用于样式
  const currentThemeName = useAppSelector(selectThemeName); // 获取当前主题名称，用于逻辑判断

  // 处理函数更新：调用新的异步 action
  const handleThemeSelect = (themeValue: string) => {
    // 类型断言，确保传入的 value 是有效的主题名称
    dispatch(changeTheme(themeValue as keyof typeof themePalettes));
  };

  return (
    <>
      <style href="ThemePicker-styles" precedence="high">
        {`
          .theme-picker-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
            gap: var(--space-3);
          }
          
          .theme-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--space-2);
            padding: var(--space-3);
            border-radius: 6px;
            background: var(--background);
            border: 1px solid var(--borderLight);
            cursor: pointer;
            position: relative;
            transition: border-color 0.15s ease;
            outline: none;
          }
          
          .theme-card:hover {
            border-color: var(--border);
          }
          
          .theme-card[data-active='true'] {
            border-color: var(--theme-color);
            background: var(--backgroundSecondary);
          }
          
          .theme-card:focus-visible {
            box-shadow: 0 0 0 2px var(--theme-focus);
          }
          
          .theme-color-swatch {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 1px solid var(--borderLight);
          }
          
          .theme-name {
            font-size: 12px;
            font-weight: 500;
            color: var(--textTertiary);
            text-align: center;
          }
          
          .theme-card[data-active='true'] .theme-name {
            color: var(--primary);
            font-weight: 600;
          }
          
          .selected-checkmark {
            position: absolute;
            top: 2px;
            right: 2px;
            color: var(--primary);
            width: 14px;
            height: 14px;
            opacity: 0;
            transition: opacity 0.15s ease;
          }
          
          .theme-card[data-active='true'] .selected-checkmark {
            opacity: 1;
          }
        `}
      </style>
      <div className="theme-picker-grid">
        {availableThemes.map(({ value, color, name }) => {
          const isActive = currentThemeName === value;
          const themeConfig =
            themePalettes[value as keyof typeof themePalettes];
          const focusColor =
            themeConfig?.light.focus || "rgba(128, 128, 128, 0.1)";

          return (
            <div
              key={value}
              className="theme-card"
              data-active={isActive}
              style={
                {
                  "--theme-color": color,
                  "--theme-focus": focusColor,
                } as React.CSSProperties
              }
              onClick={() => handleThemeSelect(value)}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && handleThemeSelect(value)
              }
              role="button"
              aria-pressed={isActive}
              aria-label={t("settings.theme.changeTo", { themeName: name })}
              tabIndex={0}
            >
              <div
                className="theme-color-swatch"
                style={{ backgroundColor: color }}
              />
              {/* 根据需求移除主题名称显示 */}
              {isActive && (
                <div className="selected-checkmark">
                  <CheckCircleFillIcon size={10} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};
