import authReducer from "auth/authSlice";
import messageReducer from "chat/messages/messageSlice";
import dbReducer from "database/dbSlice";
import themeReducer from "app/theme/themeSlice";
import { configureStore } from "@reduxjs/toolkit";
import { api } from "app/api";
import settingReducer from "setting/settingSlice";

import reactotron from "../../ReactotronConfig";

const preloadedState = {};
//maybe need delete api
export const mobileStore = configureStore({
  reducer: {
    message: messageReducer,
    auth: authReducer,
    db: dbReducer,
    theme: themeReducer,
    settings: settingReducer,

    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
  enhancers: (getDefaultEnhancers) => {
    return getDefaultEnhancers().concat(reactotron.createEnhancer!());
  },

  preloadedState,
});
