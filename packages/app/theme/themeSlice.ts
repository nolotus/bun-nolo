import { createSlice } from "@reduxjs/toolkit";
import OpenProps from "open-props";
import { blues } from "../colors";
import { lightTheme } from "./lightTheme";
// 定义一个主色调数组
const mainColors = [...blues];

const initialState = {
  themeName: "light",
  isDarkMode: false,
  mainColor: lightTheme.mainActiveColor,
  brandColor: OpenProps["--blue-5"],
  statusBarColor: lightTheme.statusBarColor,
  mainBackgroundColor: lightTheme.mainBackgroundColor,
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
    // 增加改变主色调的函数
    changeMainColor: (state, action) => {
      if (mainColors.includes(action.payload)) {
        state.mainColor = action.payload;
      }
    },
  },
});

// 导出 actions
export const { toggleTheme, setTheme, changeMainColor } = themeSlice.actions;

// 导出 mainColors 数组
export const mainColorOptions = mainColors;

// 导出 reducer
export default themeSlice.reducer;
