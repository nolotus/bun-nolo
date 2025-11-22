import React, { lazy } from "react";
import { Navigate } from "react-router-dom";
import { SettingRoutePaths } from "./config";

// Layout 同步导入（不 lazy）
import SettingLayout from "./web/SettingLayout";

// 子页面全部 lazy
const Appearance = lazy(() => import("./web/Appearance"));
const UserProfile = lazy(() => import("./web/UserProfile"));
const EditorConfig = lazy(() => import("./web/EditorConfig"));
const ChatConfig = lazy(() => import("./web/ChatConfig"));
const Productivity = lazy(() => import("./web/Productivity"));

export const settingRoutes = {
  path: SettingRoutePaths.SETTING,
  element: <SettingLayout />, // 注意：这里不再用 Suspense 包裹
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
