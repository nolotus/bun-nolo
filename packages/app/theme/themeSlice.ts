// app/theme/themeSlice.ts

import { createSlice } from "@reduxjs/toolkit";

import { dimTheme } from "./dimTheme";
import { lightTheme } from "./lightTheme";

const createExtendedTheme = (themeColors ) => ({
  sidebarWidth: 260,
  ...themeColors,
});

const extendedLightTheme = createExtendedTheme(lightTheme );
const extendedDimTheme = createExtendedTheme(dimTheme);

const themes = {
  light: extendedLightTheme,
  dim: extendedDimTheme,
};

const initialState = {
  themeName: "light",
  isDark: false,
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
        };
      }
      return state;
    },

    setSidebarWidth: (state, action) => {
      state.sidebarWidth = action.payload;
    },

    setDarkMode: (state, action) => {
      state.isDark = action.payload;
      state.themeName = action.payload ? 'dim' : 'light';
      return {
        ...state,
        ...themes[state.themeName],
      };
    },
  },
});

export const { setTheme, setSidebarWidth, setDarkMode } = themeSlice.actions;

export const selectTheme = (state) => state.theme;
export const selectIsDark = (state) => state.theme.isDark;

export default themeSlice.reducer;
