import authReducer from "auth/authSlice";
import messageReducer from "chat/messages/messageSlice";
import dialogSlice from "chat/dialog/dialogSlice";

import dbReducer from "database/dbSlice";
import pageReducer from "render/page/pageSlice";
import settingReducer from "setting/settingSlice";
import workspaceRecer from "create/workspace/workspaceSlice";
import { api } from "./api";
import themeSliceReducer from "./theme/themeSlice";

export const reducer = {
  dialog: dialogSlice,
  message: messageReducer,
  auth: authReducer,
  page: pageReducer,
  db: dbReducer,
  theme: themeSliceReducer,
  settings: settingReducer,
  workspace: workspaceRecer,
  [api.reducerPath]: api.reducer,
};
