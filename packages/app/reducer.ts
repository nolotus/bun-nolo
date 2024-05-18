import authReducer from "auth/authSlice";
import messageSlice from "chat/messages/messageSlice";
import dialogSlice from "chat/dialog/dialogSlice";

import dbReducer from "database/dbSlice";
import lifeReducer from "life/lifeSlice";
import pageReducer from "render/page/pageSlice";
import themeSliceReducer from "./theme/themeSlice";
import settingReducer from "setting/settingSlice";
import { api } from "./api";

export const reducer = {
  life: lifeReducer,
  dialog: dialogSlice,
  message: messageSlice,
  auth: authReducer,
  page: pageReducer,
  db: dbReducer,
  theme: themeSliceReducer,
  setting: settingReducer,
  [api.reducerPath]: api.reducer,
};
