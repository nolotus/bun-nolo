import SettingLayout from "./SettingLayout";
import UserProfile from "setting/pages/UserProfile";
import EditorConfig from "setting/pages/EditorConfig";
import { SettingRoutePaths } from "./config";

// routes.ts

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

  ],
};
