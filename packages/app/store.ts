import { configureStore } from '@reduxjs/toolkit';
import chatReducer from 'chat/chatSlice';
import userReducer from 'user/userSlice';

// import { setupListeners } from '@reduxjs/toolkit/query'
import { api } from './services/api';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    user: userReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
