import chatReducer from 'chat/chatSlice';
import dbReducer from 'database/dbSlice';
import lifeReducer from 'life/lifeSlice';
import pageReducer from 'render/page/pageSlice';
import authReducer from 'auth/authSlice';

import { api } from './api';

export const reducer = {
  life: lifeReducer,
  chat: chatReducer,
  auth: authReducer,
  page: pageReducer,
  db: dbReducer,
  [api.reducerPath]: api.reducer,
};
