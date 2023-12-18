import authReducer from "auth/authSlice";
import chatReducer from "chat/chatSlice";
import messageReducer from "chat/messages/messageSlice"; // 修改命名
import dbReducer from "database/dbSlice";
import lifeReducer from "life/lifeSlice";
import themeReducer from "app/theme/themeSlice"; // 假设存在 theme/themeSlice
import { configureStore } from "@reduxjs/toolkit";
import { api } from "app/api";

const preloadedState = {};

export const mobileStore = configureStore({
	reducer: {
		life: lifeReducer,
		chat: chatReducer,
		auth: authReducer,
		message: messageReducer, // 使用修改后的命名
		db: dbReducer,
		theme: themeReducer, // 添加themeReducer
		[api.reducerPath]: api.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(api.middleware),
	preloadedState,
});
