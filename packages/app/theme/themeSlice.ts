// app/theme/themeSlice.ts

import { createSlice } from "@reduxjs/toolkit";
import OpenProps from "open-props";
import { blues } from "../colors";

const mainColors = [...blues];

const commonThemeValues = {
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
};
// 辅助函数：根据断点生成响应式值
const createResponsiveValue = (values) => {
  return (screenWidth) => {
    const breakpointIndex = commonThemeValues.breakpoints.findIndex(
      (bp) => screenWidth < bp,
    );
    return values[breakpointIndex === -1 ? values.length - 1 : breakpointIndex];
  };
};

export const lightTheme = {
  ...commonThemeValues,
  link: OpenProps.indigo7,
  linkVisited: OpenProps.purple7,
  text1: OpenProps.gray12,
  text2: OpenProps.gray7,
  surface1: OpenProps.gray0,
  surface2: OpenProps.gray2,
  surface3: OpenProps.gray3,
  surface4: OpenProps.gray4,
  scrollthumbColor: OpenProps.gray7,
  accentColor: OpenProps.indigo7,
  backgroundColor: OpenProps.gray0,
  caretColor: OpenProps.indigo7,
  colorScheme: "light",
  chatListPadding: OpenProps.sizeFluid5,
  getResponsiveLabelWidth: createResponsiveValue(
    commonThemeValues.form.labelWidth,
  ),
  getResponsiveInputWidth: createResponsiveValue(
    commonThemeValues.form.inputWidth,
  ),
  sidebarWidth: 300, // 添加初始侧边栏宽度
};

export const darkTheme = {
  ...commonThemeValues,
  link: OpenProps.indigo3,
  linkVisited: OpenProps.purple3,
  text1: OpenProps.gray1,
  text2: OpenProps.gray4,
  surface1: OpenProps.gray9,
  surface2: OpenProps.gray8,
  surface3: OpenProps.gray7,
  surface4: OpenProps.gray6,
  scrollthumbColor: OpenProps.gray6,
  accentColor: OpenProps.indigo3,
  backgroundColor: OpenProps.gray9,
  caretColor: OpenProps.indigo3,
  colorScheme: "dark",
  shadowStrength: "10%",
  shadowColor: "220 40% 2%",
  chatListPadding: OpenProps.sizeFluid5,
  getResponsiveLabelWidth: createResponsiveValue(
    commonThemeValues.form.labelWidth,
  ),
  getResponsiveInputWidth: createResponsiveValue(
    commonThemeValues.form.inputWidth,
  ),
  sidebarWidth: 300, // 添加初始侧边栏宽度
};

const initialState = {
  themeName: "light",
  ...lightTheme,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      const newTheme = state.themeName === "light" ? darkTheme : lightTheme;
      return {
        ...state,
        ...newTheme,
        themeName: state.themeName === "light" ? "dark" : "light",
        isDarkMode: state.themeName === "light",
      };
    },
    setTheme: (state, action) => {
      const newName = action.payload;
      const newTheme = newName === "dark" ? darkTheme : lightTheme;
      return {
        ...state,
        ...newTheme,
        themeName: newName,
        isDarkMode: newName === "dark",
      };
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

export const { toggleTheme, setTheme, changeMainColor, setSidebarWidth } =
  themeSlice.actions;

export const mainColorOptions = mainColors;

export const selectTheme = (state) => state.theme;
export const selectIsDarkMode = (state) => state.theme.themeName === "dark";

export default themeSlice.reducer;
