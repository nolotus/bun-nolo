import authReducer from "auth/authSlice";
import dialogSlice from "chat/dialog/dialogSlice";
import messageReducer from "chat/messages/messageSlice";

import cybotReducer from "ai/cybot/cybotSlice";
import spaceRecer from "create/space/spaceSlice";
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
  space: spaceRecer,
  cybot: cybotReducer,
};
