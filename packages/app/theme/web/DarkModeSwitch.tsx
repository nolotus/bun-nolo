import React from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "app/store";
// 更新导入，使用新的 actions 和 selectors
import {
  changeDarkMode,
  setThemeFollowsSystem,
  selectIsDark,
  selectTheme,
  selectThemeFollowsSystem,
} from "app/settings/settingSlice";
import { SunIcon, MoonIcon, DeviceDesktopIcon } from "@primer/octicons-react";

type ThemeOption = "light" | "dark" | "system";

export const DarkModeSwitch: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const isDark = useAppSelector(selectIsDark);
  const themeFollowsSystem = useAppSelector(selectThemeFollowsSystem);

  const handleOptionClick = (option: ThemeOption) => {
    if (option === "system") {
      dispatch(setThemeFollowsSystem(true));
      // 当设置为跟随系统时，让全局监听器去处理实际的主题切换
    } else {
      // 如果之前是跟随系统，先关闭该选项
      if (themeFollowsSystem) {
        dispatch(setThemeFollowsSystem(false));
      }
      dispatch(changeDarkMode(option === "dark"));
    }
  };

  // 决定当前哪个按钮是激活状态
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
      icon: <SunIcon size={16} />,
      label: t("settings.theme.light"),
    },
    {
      value: "dark",
      icon: <MoonIcon size={16} />,
      label: t("settings.theme.dark"),
    },
    {
      value: "system",
      icon: <DeviceDesktopIcon size={16} />,
      label: t("settings.theme.system"),
    },
  ];

  return (
    <>
      <style href="DarkModeSwitch-styles" precedence="high">
        {`
          .dark-mode-switch-container {
            display: flex;
            padding: ${theme.space[1]};
            background-color: ${theme.backgroundTertiary};
            border-radius: 8px;
            position: relative;
            width: fit-content;
          }
          .dark-mode-option {
            padding: ${theme.space[1]} ${theme.space[3]};
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: ${theme.space[2]};
            font-size: 14px;
            font-weight: 500;
            color: ${theme.textTertiary};
            background-color: transparent;
            border: none;
            position: relative;
            z-index: 1;
            transition: color 0.3s ease;
            white-space: nowrap;
          }
          .dark-mode-option.active {
            color: ${theme.text};
          }
          .dark-mode-glider {
            position: absolute;
            top: 4px;
            bottom: 4px;
            left: 4px;
            border-radius: 6px;
            background-color: ${theme.background};
            box-shadow: 0 1px 3px ${theme.shadowLight};
            border: 1px solid ${theme.border};
            transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            /* JS会设置宽度和transform */
          }
        `}
      </style>
      <div className="dark-mode-switch-container" id="darkModeSwitchContainer">
        <div className="dark-mode-glider" id="darkModeGlider"></div>
        {options.map((option) => (
          <button
            key={option.value}
            id={`option-${option.value}`}
            className={`dark-mode-option ${activeOption === option.value ? "active" : ""}`}
            onClick={() => handleOptionClick(option.value)}
            aria-pressed={activeOption === option.value}
          >
            {option.icon}
            {option.label}
          </button>
        ))}
      </div>
      <script>
        {`
          // 使用原生JS来动态移动滑块，以获得最佳性能
          try {
            const container = document.getElementById('darkModeSwitchContainer');
            const glider = document.getElementById('darkModeGlider');
            const activeBtn = container.querySelector('.dark-mode-option.active');
            if (glider && activeBtn) {
              glider.style.width = activeBtn.offsetWidth + 'px';
              glider.style.transform = 'translateX(' + activeBtn.offsetLeft - container.offsetLeft -4 + 'px)';
            }
          } catch (e) {}
        `}
      </script>
    </>
  );
};
