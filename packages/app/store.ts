// 文件路径: app/store.ts

import { configureStore } from "@reduxjs/toolkit";
import { pageListenerMiddleware } from "render/page/pageSlice";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import { reducer } from "./reducer";

// 【核心】创建一个可重用的 store 工厂函数
// 它接受可选的 preloadedState 作为参数
export const createAppStore = (preloadedState?: Partial<RootState>) => {
  return configureStore({
    reducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).prepend(pageListenerMiddleware.middleware),
    preloadedState, // 使用传入的 preloadedState
  });
};

// 导出类型，这些类型在客户端和服务器端都是通用的
export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch: () => AppDispatch = useDispatch;

// 在 window 上定义一个类型安全的 __PRELOADED_STATE__
declare global {
  interface Window {
    __PRELOADED_STATE__?: RootState;
  }
}
