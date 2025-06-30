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
// 这部分逻辑不需要改变
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
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
            gap: ${theme.space[3]}; /* 稍微减小间距，更紧凑 */
          }
          .theme-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: ${theme.space[2]};
            padding: ${theme.space[3]};
            border-radius: 8px; /* 柔和的圆角 */
            border: 1px solid ${theme.border}; /* 更纤细的边框 */
            background-color: ${theme.backgroundSecondary};
            cursor: pointer;
            position: relative;
            transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
            -webkit-tap-highlight-color: transparent; /* 移除移动端点击高亮 */
          }
          .theme-card:hover {
            transform: translateY(-2px); /* 悬浮效果更克制 */
            border-color: ${theme.borderHover};
          }
          .theme-card[data-active='true'] {
            border-color: var(--theme-color);
            box-shadow: 0 0 0 2px var(--theme-color); /* 选中效果更精致 */
          }
          .theme-color-swatch {
            width: 32px; /* 尺寸更纤细 */
            height: 32px;
            border-radius: 50%;
            border: 1px solid ${theme.border};
          }
          .theme-name {
            font-size: 13px; /* 字体大小调整 */
            font-weight: 500;
            color: ${theme.textSecondary};
            text-align: center;
          }
          .selected-checkmark {
            position: absolute;
            top: 4px; /* 调整位置 */
            right: 4px;
            color: var(--theme-color);
            background-color: ${theme.background};
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transform: scale(0.8);
            transition: opacity 0.2s ease, transform 0.2s ease;
          }
          .theme-card[data-active='true'] .selected-checkmark {
            opacity: 1;
            transform: scale(1);
          }
        `}
      </style>
      <div className="theme-picker-grid">
        {availableThemes.map(({ value, color, name }) => {
          const isActive = currentThemeName === value;
          const focusColor =
            themePalettes[value as keyof typeof themePalettes]?.light.focus ||
            "rgba(128, 128, 128, 0.3)";

          return (
            <div
              key={value}
              className="theme-card"
              data-active={isActive}
              style={
                {
                  "--theme-color": color,
                  "--theme-focus-color": focusColor,
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
              <span className="theme-name">{t(name)}</span> {/* 使用 i18n */}
              {isActive && (
                <div className="selected-checkmark">
                  <CheckCircleFillIcon size={20} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};
