import React, { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { SettingRoutePaths } from "./config";

// 仅 Layout 懒加载
const SettingLayout = lazy(() => import("./web/SettingLayout"));

// 子页面同步导入（不 lazy）
import Appearance from "./web/Appearance";
import UserProfile from "./web/UserProfile";
import EditorConfig from "./web/EditorConfig";
import ChatConfig from "./web/ChatConfig";
import Productivity from "./web/Productivity";

const SettingsFallback = (
  <div
    style={{ padding: 40, textAlign: "center", color: "var(--textSecondary)" }}
  >
    加载设置中...
  </div>
);

export const settingRoutes = {
  path: SettingRoutePaths.SETTING,
  element: (
    <Suspense fallback={SettingsFallback}>
      <SettingLayout />
    </Suspense>
  ),
  children: [
    {
      index: true,
      element: <Navigate to={SettingRoutePaths.SETTING_APPEARANCE} replace />,
    },
    { path: SettingRoutePaths.SETTING_APPEARANCE, element: <Appearance /> },
    { path: SettingRoutePaths.SETTING_ACCOUNT, element: <UserProfile /> },
    { path: SettingRoutePaths.SETTING_EDITOR, element: <EditorConfig /> },
    { path: SettingRoutePaths.SETTING_CHAT, element: <ChatConfig /> },
    { path: SettingRoutePaths.SETTING_PRODUCTIVITY, element: <Productivity /> },
  ],
};
