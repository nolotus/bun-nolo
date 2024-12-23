import { configureStore } from "@reduxjs/toolkit";
import { api } from "app/api";
import { reducer } from "app/reducer";

//maybe could delete api
export const browserStore = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(api.middleware),
  preloadedState: window.__PRELOADED_STATE__,
});
