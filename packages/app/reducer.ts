import authReducer from "auth/authSlice";
import databaseReducer from "database/dbSlice";
import settingReducer from "app/settings/settingSlice";

import pageReducer from "render/page/pageSlice";
import cybotReducer from "ai/cybot/cybotSlice";
import spaceRecer from "create/space/spaceSlice";

import dialogReducer from "chat/dialog/dialogSlice";
import messageReducer from "chat/messages/messageSlice";
import planSlice from "ai/llm/planSlice";

export const reducer = {
  dialog: dialogReducer,
  plan: planSlice,
  message: messageReducer,
  auth: authReducer,
  page: pageReducer,
  db: databaseReducer,
  settings: settingReducer,
  space: spaceRecer,
  cybot: cybotReducer,
};
