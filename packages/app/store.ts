import { configureStore } from '@reduxjs/toolkit';

import { api } from './api';
import { reducer } from './reducer';
// import { setupListeners } from '@reduxjs/toolkit/query'

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
