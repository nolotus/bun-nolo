// app/theme/themeSlice.ts

import { createSlice } from "@reduxjs/toolkit";
import OpenProps from "open-props";
import { blues } from "../colors";
import { lightTheme } from "./lightTheme";
import { darkTheme } from "./darkTheme";
import { grapeTheme } from "./grapeTheme";
import { dimTheme } from "./dimTheme";
import { darkerTheme } from "./darkerTheme";
import { chocoTheme } from "./chocoTheme";

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
  iconSize: {
    small: 14,
    medium: 16,
    large: 20,
  },
  form: {
    fieldSpacing: "16px",
    labelWidth: ["100%", "100%", "30%", "25%", "20%", "20%"],
    inputWidth: ["100%", "100%", "70%", "75%", "80%", "80%"],
  },
  breakpoints: [480, 640, 768, 1024, 1280, 1536],
  topbarHeight: "40px",
  topBarMargin: "8px",
  topBarPadding: "8px",
  topBarZIndex: 1,
  sidebarPadding: "8px",
  sidebarWidth: 300,
};

const createResponsiveValue = (values) => {
  return (screenWidth) => {
    const breakpointIndex = baseTheme.breakpoints.findIndex(
      (bp) => screenWidth < bp,
    );
    return values[breakpointIndex === -1 ? values.length - 1 : breakpointIndex];
  };
};

const createExtendedTheme = (baseTheme, themeColors) => ({
  ...baseTheme,
  ...themeColors,
  link: themeColors.brand,
  linkVisited: OpenProps.purple5,
  scrollthumbColor: themeColors.text2,
  accentColor: themeColors.brand,
  backgroundColor: themeColors.surface1,
  caretColor: themeColors.brand,
  getResponsiveLabelWidth: createResponsiveValue(baseTheme.form.labelWidth),
  getResponsiveInputWidth: createResponsiveValue(baseTheme.form.inputWidth),
});

const extendedLightTheme = createExtendedTheme(baseTheme, lightTheme);
const extendedDarkTheme = createExtendedTheme(baseTheme, darkTheme);
const extendedGrapeTheme = createExtendedTheme(baseTheme, grapeTheme);
const extendedDimTheme = createExtendedTheme(baseTheme, dimTheme);
const extendedDarkerTheme = createExtendedTheme(baseTheme, darkerTheme);
const extendedChocoTheme = createExtendedTheme(baseTheme, chocoTheme);

const themes = {
  light: extendedLightTheme,
  dark: extendedDarkTheme,
  grape: extendedGrapeTheme,
  dim: extendedDimTheme,
  darker: extendedDarkerTheme,
  choco: extendedChocoTheme,
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
