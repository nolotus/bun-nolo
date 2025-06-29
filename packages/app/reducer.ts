import messageReducer from "chat/messages/messageSlice";
import authReducer from "auth/authSlice";
import cybotReducer from "ai/cybot/cybotSlice";
import pageReducer from "render/page/pageSlice";

import themeSliceReducer from "./theme/themeSlice";
import dbReducer from "database/dbSlice";
import settingReducer from "app/settings/settingSlice";
import dialogSlice from "chat/dialog/dialogSlice";
import spaceRecer from "create/space/spaceSlice";
import planSlice from "ai/llm/planSlice";
export const reducer = {
  dialog: dialogSlice,
  plan: planSlice,
  message: messageReducer,
  auth: authReducer,
  page: pageReducer,
  db: dbReducer,
  theme: themeSliceReducer,
  settings: settingReducer,
  space: spaceRecer,
  cybot: cybotReducer,
};
