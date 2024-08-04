import authReducer from "auth/authSlice";
import messageSlice from "chat/messages/messageSlice";
import dialogSlice from "chat/dialog/dialogSlice";

import dbReducer from "database/dbSlice";
import lifeReducer from "life/lifeSlice";
import pageReducer from "render/page/pageSlice";
import settingReducer from "setting/settingSlice";

import { api } from "./api";
import themeSliceReducer from "./theme/themeSlice";

export const reducer = {
  life: lifeReducer,
  dialog: dialogSlice,
  message: messageSlice,
  auth: authReducer,
  page: pageReducer,
  db: dbReducer,
  theme: themeSliceReducer,
  settings: settingReducer,
  [api.reducerPath]: api.reducer,
};
