// 文件路径: .../mobileStore.ts (假设)

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "auth/authSlice";
import messageReducer from "chat/messages/messageSlice";
import dbReducer from "database/dbSlice";
import settingReducer from "app/settings/settingSlice";

// 同样地，我们需要导入 pageSlice 和它的 listener middleware
// 假设 mobile store 也需要 page 的功能
import pageReducer, { pageListenerMiddleware } from "render/page/pageSlice"; // <-- 【第1步】导入 reducer 和 middleware

import reactotron from "../../ReactotronConfig";

// 预加载状态，移动端通常为空对象
const preloadedState = {};

export const mobileStore = configureStore({
  // 在 reducer 中添加 page reducer
  reducer: {
    // 原有的 reducers
    message: messageReducer,
    auth: authReducer,
    db: dbReducer,
    settings: settingReducer,
    // 新增的 reducer
    page: pageReducer, // <-- 【第2步】添加 page reducer
  },

  // 配置中间件
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // 如果移动端也处理 Slate.js 内容，同样建议关闭序列化检查
      serializableCheck: false,
    }).prepend(pageListenerMiddleware.middleware), // <-- 【第3步】安装 listener middleware

  // Enhancers 配置保持不变，它与 middleware 是独立配置的
  enhancers: (getDefaultEnhancers) => {
    // 确保 reactotron.createEnhancer 是一个函数再调用
    if (typeof reactotron.createEnhancer === "function") {
      return getDefaultEnhancers().concat(reactotron.createEnhancer());
    }
    return getDefaultEnhancers();
  },

  preloadedState,
});
