import chatReducer from 'chat/chatSlice';
import dbReducer from 'database/dbSlice';
import lifeReducer from 'life/lifeSlice';
import pageReducer from 'render/page/pageSlice';
import userReducer from 'user/userSlice';

import { api } from './api';

export const reducer = {
  life: lifeReducer,
  chat: chatReducer,
  user: userReducer,
  page: pageReducer,
  db: dbReducer,
  [api.reducerPath]: api.reducer,
};
