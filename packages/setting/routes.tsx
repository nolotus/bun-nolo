import React from "react";
import SettingLayout from "./SettingLayout";
import UserProfile from "setting/pages/UserProfile";
import EditorConfig from "setting/pages/EditorConfig";
import Sync from "setting/pages/Sync";
import AccountSettings from "setting/pages/AccountSettings";
import Website from "setting/pages/Website";
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
    {
      path: SettingRoutePaths.SETTING_SYNC,
      element: <Sync />,
    },
    {
      path: SettingRoutePaths.SETTING_ACCOUNT,
      element: <AccountSettings />,
    },
    {
      path: SettingRoutePaths.SETTING_WEBSITE,
      element: <Website />,
    },
  ],
};
