// File: mobileStore.ts

import { configureStore } from "@reduxjs/toolkit";

import authReducer from "auth/authSlice";
import messageReducer from "chat/messages/messageSlice";
import dbReducer from "database/dbSlice";
import settingReducer from "app/settings/settingSlice";

// page：渲染相关（含 listener middleware）
import pageReducer, { pageListenerMiddleware } from "render/page/pageSlice";

// 工具调用 trace：ToolRun（新加）
import toolRunReducer from "ai/tools/toolRunSlice";

// 预加载状态，移动端通常为空对象
const preloadedState = {};

export const mobileStore = configureStore({
  reducer: {
    // 原有 reducers
    message: messageReducer,
    auth: authReducer,
    db: dbReducer,
    settings: settingReducer,

    // 渲染相关
    page: pageReducer,

    // 工具调用 trace
    toolRun: toolRunReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // 如果移动端也处理 Slate.js 内容，同样建议关闭序列化检查
      serializableCheck: false,
    }).prepend(pageListenerMiddleware.middleware),

  enhancers: (getDefaultEnhancers) => {
    return getDefaultEnhancers();
  },

  preloadedState,
});

// 如果需要推导 RootState / AppDispatch，可以在这里导出类型
export type MobileRootState = ReturnType<typeof mobileStore.getState>;
export type MobileAppDispatch = typeof mobileStore.dispatch;
