import authReducer from "auth/authSlice";
import databaseReducer from "database/dbSlice";
import settingReducer from "app/settings/settingSlice";

import pageReducer from "render/page/pageSlice";
import cybotReducer from "ai/cybot/cybotSlice";
import spaceRecer from "create/space/spaceSlice";

import dialogReducer from "chat/dialog/dialogSlice";
import messageReducer from "chat/messages/messageSlice";
import planSlice from "ai/agent/planSlice";

// 新增：工具调用 trace
import toolRunReducer from "ai/tools/toolRunSlice";

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

  // 新增：ToolRun 状态
  toolRun: toolRunReducer,
};
