import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "chat/chatSlice";
import userReducer from "user/userSlice";
// import { setupListeners } from '@reduxjs/toolkit/query'
import { authApi } from "./services/auth";

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware)
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
