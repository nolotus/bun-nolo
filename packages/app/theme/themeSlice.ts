import { createSlice } from "@reduxjs/toolkit";
import { blues } from "../colors";
import { lightTheme } from "./lightTheme";
// 定义一个主色调数组
const mainColors = [...blues];

const initialState = {
	theme: "light",
	mainColor: lightTheme.mainActiveColor, // 初始状态使用 lightTheme 的颜色
	statusBarColor: lightTheme.statusBarColor,
	mainBackgroundColor: lightTheme.mainBackgroundColor,
};

const themeSlice = createSlice({
	name: "theme",
	initialState,
	reducers: {
		toggleTheme: (state) => {
			state.theme = state.theme === "light" ? "dark" : "light";
		},
		setTheme: (state, action) => {
			state.theme = action.payload;
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
