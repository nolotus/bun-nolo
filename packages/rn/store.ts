import authReducer from "auth/authSlice";
import messageReducer from "chat/messages/messageSlice";
import dbReducer from "database/dbSlice";
import lifeReducer from "life/lifeSlice";
import themeReducer from "app/theme/themeSlice";
import { configureStore } from "@reduxjs/toolkit";
import { api } from "app/api";
import reactotron from "../../ReactotronConfig";
const preloadedState = {};

export const mobileStore = configureStore({
  reducer: {
    life: lifeReducer,
    message: messageReducer,
    auth: authReducer,
    db: dbReducer,
    theme: themeReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
  enhancers: (getDefaultEnhancers) => {
    return getDefaultEnhancers().concat(reactotron.createEnhancer!());
  },

  preloadedState,
});
