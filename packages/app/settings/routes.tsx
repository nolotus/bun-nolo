import { Navigate } from "react-router-dom";
import { SettingRoutePaths } from "./config";

// 直接导入所有设置页面组件，确保即时加载
import Appearance from "./web/Appearance";
import SettingLayout from "./web/SettingLayout";
import UserProfile from "./web/UserProfile";
import EditorConfig from "./web/EditorConfig";
import ChatConfig from "./web/ChatConfig";
import Productivity from "./web/Productivity";

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
