import { configureStore } from "@reduxjs/toolkit";
import { reducer } from "app/reducer";

//maybe could delete api
export const browserStore = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  preloadedState: window.__PRELOADED_STATE__,
});
