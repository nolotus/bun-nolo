import { Navigate } from "react-router-dom";
import SettingLayout from "./SettingLayout";
import { SettingRoutePaths } from "./config";

// 直接导入所有设置页面组件，确保即时加载
import Appearance from "setting/pages/Appearance";
import UserProfile from "setting/pages/UserProfile";
import EditorConfig from "setting/pages/EditorConfig";
import ChatConfig from "setting/pages/ChatConfig";
import Productivity from "setting/pages/Productivity";

export const settingRoutes = {
  path: SettingRoutePaths.SETTING,
  element: <SettingLayout />,
  children: [
    {
      // 默认路由，当访问 /setting 时，重定向到外观设置
      index: true,
      element: <Navigate to={SettingRoutePaths.SETTING_APPEARANCE} replace />,
    },
    {
      path: SettingRoutePaths.SETTING_APPEARANCE,
      element: <Appearance />,
    },
    {
      path: SettingRoutePaths.SETTING_ACCOUNT,
      element: <UserProfile />,
    },
    {
      path: SettingRoutePaths.SETTING_EDITOR,
      element: <EditorConfig />,
    },
    {
      path: SettingRoutePaths.SETTING_CHAT,
      element: <ChatConfig />,
    },
    {
      path: SettingRoutePaths.SETTING_PRODUCTIVITY,
      element: <Productivity />,
    },
  ],
};
