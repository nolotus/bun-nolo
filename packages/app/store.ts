import { configureStore } from '@reduxjs/toolkit';
import chatReducer from 'chat/chatSlice';
import dbReducer from 'database/dbSlice';
import lifeReducer from 'life/lifeSlice';
import pageReducer from 'render/page/pageSlice';
import userReducer from 'user/userSlice';

// import { setupListeners } from '@reduxjs/toolkit/query'
import { api } from './api';

export const store = configureStore({
  reducer: {
    life: lifeReducer,
    chat: chatReducer,
    user: userReducer,
    page: pageReducer,
    db: dbReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
