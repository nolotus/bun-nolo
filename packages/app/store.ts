import { configureStore } from "@reduxjs/toolkit";
import { api } from "./api";
import { reducer } from "./reducer";

// 确定预加载状态是否存在，以便适配服务端和客户端
const preloadedState =
  typeof window !== "undefined" ? window.__PRELOADED_STATE__ : undefined;

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
  // 按照环境存在与否设置预加载状态
  preloadedState,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
