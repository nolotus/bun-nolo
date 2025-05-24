// routes.ts
import SettingLayout from "./SettingLayout";
import UserProfile from "setting/pages/UserProfile";
import EditorConfig from "setting/pages/EditorConfig";
import ChatConfig from "setting/pages/ChatConfig";
import { SettingRoutePaths } from "./config";

export const settingRoutes = {
  path: SettingRoutePaths.SETTING,
  element: <SettingLayout />,
  children: [
    {
      index: true,
      path: SettingRoutePaths.SETTING_USER_PROFILE,
      element: <UserProfile />,
    },
    {
      path: SettingRoutePaths.SETTING_EDITOR_CONFIG,
      element: <EditorConfig />,
    },
    {
      path: SettingRoutePaths.SETTING_CHAT_CONFIG,
      element: <ChatConfig />, // 新增对话设置路由
    },
  ],
};
