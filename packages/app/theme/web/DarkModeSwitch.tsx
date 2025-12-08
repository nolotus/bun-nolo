import React from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "app/store";
// 更新导入，使用新的 actions 和 selectors
import {
  changeDarkMode,
  setThemeFollowsSystem,
  selectIsDark,
  selectThemeFollowsSystem,
} from "app/settings/settingSlice";
import { SunIcon, MoonIcon, DeviceDesktopIcon } from "@primer/octicons-react";

type ThemeOption = "light" | "dark" | "system";

export const DarkModeSwitch: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isDark = useAppSelector(selectIsDark);
  const themeFollowsSystem = useAppSelector(selectThemeFollowsSystem);

  const handleOptionClick = (option: ThemeOption) => {
    if (option === "system") {
      dispatch(setThemeFollowsSystem(true));
    } else {
      if (themeFollowsSystem) {
        dispatch(setThemeFollowsSystem(false));
      }
      dispatch(changeDarkMode(option === "dark"));
    }
  };

  const getActiveOption = (): ThemeOption => {
    if (themeFollowsSystem) {
      return "system";
    }
    return isDark ? "dark" : "light";
  };

  const activeOption = getActiveOption();
  const options: {
    value: ThemeOption;
    icon: React.ReactNode;
    label: string;
  }[] = [
    {
      value: "light",
      icon: <SunIcon size={14} />,
      label: t("settings.theme.light"),
    },
    {
      value: "dark",
      icon: <MoonIcon size={14} />,
      label: t("settings.theme.dark"),
    },
    {
      value: "system",
      icon: <DeviceDesktopIcon size={14} />,
      label: t("settings.theme.system"),
    },
  ];

  return (
    <>
      <style href="DarkModeSwitch-styles" precedence="high">
        {`
          .dark-mode-switch-container {
            display: inline-flex;
            padding: var(--space-1);
            background: var(--backgroundTertiary);
            border-radius: 6px;
            border: 1px solid var(--borderLight);
          }
          
          .dark-mode-option {
            padding: var(--space-2) var(--space-3);
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: var(--space-2);
            font-size: 13px;
            font-weight: 500;
            color: var(--textTertiary);
            background: transparent;
            border: none;
            transition: color 0.15s ease, background-color 0.15s ease;
            white-space: nowrap;
            outline: none;
          }
          
          .dark-mode-option:hover {
            color: var(--textSecondary);
          }
          
          .dark-mode-option.active {
            color: var(--text);
            background: var(--background);
            border: 1px solid var(--border);
          }
          
          .dark-mode-option:focus-visible {
            box-shadow: 0 0 0 2px var(--primary);
          }
        `}
      </style>
      <div className="dark-mode-switch-container">
        {options.map((option) => (
          <button
            key={option.value}
            className={`dark-mode-option ${activeOption === option.value ? "active" : ""}`}
            onClick={() => handleOptionClick(option.value)}
            aria-pressed={activeOption === option.value}
            // 移除aria-label，因为只有图标
            aria-label={t(`settings.theme.${option.value}`)} // 更新aria-label以反映选项
          >
            {option.icon}
            {/* 根据需求移除主题名称显示 */}
          </button>
        ))}
      </div>
    </>
  );
};
