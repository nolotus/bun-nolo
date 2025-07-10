// 文件路径: app/store.ts

import { configureStore } from "@reduxjs/toolkit";
import { pageListenerMiddleware } from "render/page/pageSlice";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { reducer } from "./reducer";
// import type { DbInstanceType } from './database/db';

// 定义工厂函数的参数类型
interface CreateStoreOptions {
  dbInstance?: any; // <-- 设为可选. 推荐使用 DbInstanceType
  preloadedState?: Partial<RootState>;
}

// 【核心】改造后的 store 工厂函数，接受一个可选的配置对象
export const createAppStore = (options: CreateStoreOptions = {}) => {
  // 从配置对象中解构参数
  const { dbInstance, preloadedState } = options;

  return configureStore({
    reducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        thunk: {
          extraArgument: {
            // 如果 dbInstance 存在，就使用它；否则，注入 null
            // 这可以确保 thunkApi.extra.db 总是存在，避免访问属性时出错
            db: dbInstance || null,
          },
        },
      }).prepend(pageListenerMiddleware.middleware),
    preloadedState,
  });
};

// ... 其他类型定义 ...
export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

// 【关键】更新 AppThunkApi 类型，以反映 db 可能是 null
export type AppThunkApi = {
  dispatch: AppDispatch;
  getState: () => RootState;
  extra: {
    db: any | null; // <-- 明确指出 db 可能是 null
  };
};

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch: () => AppDispatch = useDispatch;

declare global {
  interface Window {
    __PRELOADED_STATE__?: RootState;
  }
}
