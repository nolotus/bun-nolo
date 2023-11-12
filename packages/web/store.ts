import { configureStore } from '@reduxjs/toolkit';
import { api } from 'app/api';
import { reducer } from 'app/reducer';
export const browserStore = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
  preloadedState: window.__PRELOADED_STATE__,
});
