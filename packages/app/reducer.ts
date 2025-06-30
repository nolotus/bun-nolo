import authReducer from "auth/authSlice";
import dbReducer from "database/dbSlice";
import settingReducer from "app/settings/settingSlice";

import pageReducer from "render/page/pageSlice";
import cybotReducer from "ai/cybot/cybotSlice";
import spaceRecer from "create/space/spaceSlice";

import dialogSlice from "chat/dialog/dialogSlice";
import messageReducer from "chat/messages/messageSlice";
import planSlice from "ai/llm/planSlice";

export const reducer = {
  dialog: dialogSlice,
  plan: planSlice,
  message: messageReducer,
  auth: authReducer,
  page: pageReducer,
  db: dbReducer,
  settings: settingReducer,
  space: spaceRecer,
  cybot: cybotReducer,
};
