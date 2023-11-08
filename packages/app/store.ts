import { configureStore } from '@reduxjs/toolkit';
import chatReducer from 'chat/chatSlice';
import pageReducer from 'create/pageSlice';
import lifeReducer from 'life/lifeSlice';
import userReducer from 'user/userSlice';

// import { setupListeners } from '@reduxjs/toolkit/query'
import { api } from './api';

export const store = configureStore({
  reducer: {
    life: lifeReducer,
    chat: chatReducer,
    user: userReducer,
    page: pageReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
