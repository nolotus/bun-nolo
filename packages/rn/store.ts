

import authReducer from "auth/authSlice";
import chatReducer from "chat/chatSlice";
import messageSlice from "chat/messages/messageSlice";
import dbReducer from "database/dbSlice";
import lifeReducer from "life/lifeSlice";
import { configureStore } from '@reduxjs/toolkit';
import { api } from "app/api";

const preloadedState={}
export const mobileStore = configureStore({
    reducer:{
        life: lifeReducer,
        chat: chatReducer,
        auth: authReducer,
        message: messageSlice,
        db: dbReducer,
        [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
    // 按照环境存在与否设置预加载状态
    preloadedState,
  });