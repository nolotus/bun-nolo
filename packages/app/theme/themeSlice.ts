import { createSlice } from "@reduxjs/toolkit";
import OpenProps from "open-props";

import { blues } from "../colors";
import { lightTheme } from "./lightTheme";
const mainColors = [...blues];

const initialState = {
  themeName: "light",
  isDarkMode: false,
  mainColor: lightTheme.mainActiveColor,
  brandColor: OpenProps["--blue-5"],
  statusBarColor: lightTheme.statusBarColor,
  mainBackgroundColor: lightTheme.mainBackgroundColor,
  textColor1: lightTheme.textColor1,
  surface1: lightTheme.surface1,
  surface2: lightTheme.surface2,
  surface3: lightTheme.surface3,
  surface4: lightTheme.surface4,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.themeName = state.themeName === "light" ? "dark" : "light";
    },
    setTheme: (state, action) => {
      const newName = action.payload;
      state.themeName = newName;
      newName === "dark"
        ? (state.isDarkMode = true)
        : (state.isDarkMode = false);
    },
    changeMainColor: (state, action) => {
      if (mainColors.includes(action.payload)) {
        state.mainColor = action.payload;
      }
    },
  },
});

export const { toggleTheme, setTheme, changeMainColor } = themeSlice.actions;

// 导出 mainColors 数组
export const mainColorOptions = mainColors;

export default themeSlice.reducer;
