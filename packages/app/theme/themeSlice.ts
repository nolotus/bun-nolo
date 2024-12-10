// app/theme/themeSlice.ts

import { createSlice } from "@reduxjs/toolkit";
import OpenProps from "open-props";

import { blues } from "../colors";
import { lightTheme } from "./lightTheme";
import { darkTheme } from "./darkTheme";
import { dimTheme } from "./dimTheme";

const mainColors = [...blues];

const baseTheme = {
  borderRadius: "5px",
  fontSize: {
    small: "12px",
    medium: "14px",
    large: "16px",
  },
  spacing: {
    xsmall: "4px",
    small: "8px",
    medium: "12px",
    large: "16px",
  },

  breakpoints: [480, 640, 768, 1024, 1280, 1536],
  sidebarWidth: 260,
};

const createExtendedTheme = (baseTheme, themeColors) => ({
  ...baseTheme,
  ...themeColors,
  link: themeColors.brand,
});

const extendedLightTheme = createExtendedTheme(baseTheme, lightTheme);
const extendedDarkTheme = createExtendedTheme(baseTheme, darkTheme);
const extendedDimTheme = createExtendedTheme(baseTheme, dimTheme);

const themes = {
  light: extendedLightTheme,
  dark: extendedDarkTheme,
  dim: extendedDimTheme,
};

const initialState = {
  themeName: "light",
  ...extendedLightTheme,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action) => {
      const newName = action.payload;
      if (themes[newName]) {
        return {
          ...state,
          ...themes[newName],
          themeName: newName,
          isDarkMode: ["dark", "darker", "dim"].includes(newName),
        };
      }
      return state;
    },
    changeMainColor: (state, action) => {
      if (mainColors.includes(action.payload)) {
        state.mainColor = action.payload;
      }
    },
    setSidebarWidth: (state, action) => {
      state.sidebarWidth = action.payload;
    },
  },
});

export const { setTheme, changeMainColor, setSidebarWidth } =
  themeSlice.actions;

export const mainColorOptions = mainColors;

export const selectTheme = (state) => state.theme;
export const selectIsDarkMode = (state) =>
  ["dark", "darker", "dim"].includes(state.theme.themeName);

export default themeSlice.reducer;
