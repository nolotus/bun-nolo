import React from "react";
import { useAppSelector, useAppDispatch } from "app/hooks";
import { setDarkMode, selectIsDark, selectTheme } from "app/theme/themeSlice";
import { SunIcon, MoonIcon } from "@primer/octicons-react";

export const DarkModeSwitch: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const isDark = useAppSelector(selectIsDark);

  const toggleDarkMode = () => {
    dispatch(setDarkMode(!isDark));
  };

  return (
    <>
      <style href="DarkModeSwitch-styles" precedence="high">
        {`
          .dark-mode-switch-wrapper {
            width: 52px;
            height: 28px;
            border-radius: 14px;
            padding: 2px;
            display: flex;
            align-items: center;
            cursor: pointer;
            position: relative;
            background-color: ${isDark ? theme.primary : theme.backgroundTertiary};
            border: 1px solid ${theme.border};
            transition: background-color 0.3s ease;
          }
          .dark-mode-switch-wrapper:hover {
            border-color: ${theme.primary};
          }
          .dark-mode-knob {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background-color: #fff;
            position: absolute;
            display: flex;
            justify-content: center;
            align-items: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            transform: translateX(${isDark ? "24px" : "2px"});
            transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
        `}
      </style>
      <button
        className="dark-mode-switch-wrapper"
        onClick={toggleDarkMode}
        aria-label="Toggle Dark Mode"
        role="switch"
        aria-checked={isDark}
      >
        <div className="dark-mode-knob">
          {isDark ? (
            <MoonIcon size={14} color="#6B46C1" />
          ) : (
            <SunIcon size={14} color="#F97316" />
          )}
        </div>
      </button>
    </>
  );
};
