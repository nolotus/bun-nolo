// components/ThemeSwitcher.tsx

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTheme, selectTheme } from "app/theme/themeSlice";

const themes = [
  { name: "light", label: "Light" },
  { name: "dark", label: "Dark" },
  { name: "grape", label: "Grape" },
  { name: "dim", label: "Dim" },
  { name: "darker", label: "Darker" },
  { name: "choco", label: "Choco" },
];

const ThemeSwitcher: React.FC = () => {
  const dispatch = useDispatch();
  const currentTheme = useSelector(selectTheme);

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setTheme(e.target.value));
  };

  return (
    <div>
      <label htmlFor="theme-select">Choose a theme: </label>
      <select
        id="theme-select"
        value={currentTheme.themeName}
        onChange={handleThemeChange}
      >
        {themes.map((theme) => (
          <option key={theme.name} value={theme.name}>
            {theme.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSwitcher;
