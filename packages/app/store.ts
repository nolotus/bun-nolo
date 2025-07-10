// 文件路径: app/store.ts

import { configureStore } from "@reduxjs/toolkit";
import { pageListenerMiddleware } from "render/page/pageSlice";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { reducer } from "./reducer";

interface CreateStoreOptions {
  dbInstance?: any;
  tokenManager?: any;
  preloadedState?: Partial<RootState>;
}

export const createAppStore = (options: CreateStoreOptions = {}) => {
  const { dbInstance, tokenManager, preloadedState } = options;

  return configureStore({
    reducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        thunk: {
          extraArgument: {
            db: dbInstance || null,
            tokenManager: tokenManager || null,
          },
        },
      }).prepend(pageListenerMiddleware.middleware),
    preloadedState,
  });
};

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export type AppThunkApi = {
  dispatch: AppDispatch;
  getState: () => RootState;
  extra: {
    db: any | null;
    tokenManager: any | null;
  };
};

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch: () => AppDispatch = useDispatch;

declare global {
  interface Window {
    __PRELOADED_STATE__?: RootState;
  }
}
