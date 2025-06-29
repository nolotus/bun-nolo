import React from "react";
import { useAppSelector, useAppDispatch } from "app/hooks";
import { setTheme, selectTheme } from "app/theme/themeSlice";
import { CheckCircleFillIcon } from "@primer/octicons-react";
import * as themePalettes from "app/theme/colors"; // 直接从你的颜色文件导入

// 动态地将导入的颜色对象转换为组件可用的数组
// 这样可以确保与 colors.ts 始终同步
const availableThemes = Object.entries(themePalettes).map(([key, palette]) => ({
  value: key, // 'blue', 'green', etc.
  color: palette.light.primary, // 使用 light 模式下的主色作为预览色
  name: palette.light.name, // 使用 light 模式下的名称作为显示名
}));

export const ThemePicker: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentTheme = useAppSelector(selectTheme);

  const handleThemeSelect = (value: string) => {
    dispatch(setTheme(value));
  };

  return (
    <>
      <style href="ThemePicker-styles" precedence="high">
        {`
          .theme-picker-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
            gap: ${currentTheme.space[4]};
          }
          .theme-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: ${currentTheme.space[2]};
            padding: ${currentTheme.space[3]};
            border-radius: ${currentTheme.borderRadius};
            border: 2px solid ${currentTheme.borderSecondary};
            background-color: ${currentTheme.backgroundSecondary};
            cursor: pointer;
            position: relative;
            transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
          }
          .theme-card:hover {
            transform: translateY(-3px);
            border-color: var(--theme-color);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          }
          .theme-card[data-active='true'] {
            border-color: var(--theme-color);
            box-shadow: 0 0 0 3px var(--theme-focus-color, rgba(128, 128, 128, 0.3));
          }
          .theme-color-swatch {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 2px solid ${currentTheme.border};
          }
          .theme-name {
            font-size: 0.85rem;
            font-weight: 500;
            color: ${currentTheme.text};
            text-align: center;
          }
          .selected-checkmark {
            position: absolute;
            top: 6px;
            right: 6px;
            color: var(--theme-color);
            background-color: ${currentTheme.background};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transform: scale(0.8);
            transition: opacity 0.2s, transform 0.2s;
          }
          .theme-card[data-active='true'] .selected-checkmark {
            opacity: 1;
            transform: scale(1);
          }
        `}
      </style>
      <div className="theme-picker-grid">
        {availableThemes.map(({ value, color, name }) => {
          const isActive = currentTheme.themeName === value;
          // 从对应的颜色配置中获取 focus 颜色
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
              role="button"
              aria-pressed={isActive}
              tabIndex={0}
            >
              <div
                className="theme-color-swatch"
                style={{ backgroundColor: color }}
              />
              <span className="theme-name">{name}</span>
              <div className="selected-checkmark">
                <CheckCircleFillIcon size={22} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
