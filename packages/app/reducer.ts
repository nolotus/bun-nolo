import authReducer from "auth/authSlice";
import dialogSlice from "chat/dialog/dialogSlice";
import messageReducer from "chat/messages/messageSlice";

import cybotReducer from "ai/cybot/cybotSlice";
import workspaceRecer from "create/workspace/workspaceSlice";
import dbReducer from "database/dbSlice";
import pageReducer from "render/page/pageSlice";
import settingReducer from "setting/settingSlice";

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
  cybot: cybotReducer,
};
