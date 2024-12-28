// app/theme/themeSlice.ts

import { createSlice } from "@reduxjs/toolkit";

import { dimTheme } from "./dimTheme";
import { lightTheme } from "./lightTheme";


const baseTheme = {

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
const extendedDimTheme = createExtendedTheme(baseTheme, dimTheme);

const themes = {
	light: extendedLightTheme,
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

		setSidebarWidth: (state, action) => {
			state.sidebarWidth = action.payload;
		},
	},
});

export const { setTheme,  setSidebarWidth } =
	themeSlice.actions;


export const selectTheme = (state) => state.theme;
export const selectIsDarkMode = (state) =>
	["dark", "darker", "dim"].includes(state.theme.themeName);

export default themeSlice.reducer;
