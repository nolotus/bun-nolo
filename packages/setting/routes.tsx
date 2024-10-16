import React, { lazy } from "react";
import { createRoute } from "web/createRoute";

import { USER_PROFILE_ROUTE, EDITOR_CONFIG } from "setting/config";

const Sync = lazy(() => import("setting/pages/Sync"));
const AccountSettings = lazy(() => import("setting/pages/AccountSettings"));
const UserProfile = lazy(() => import("setting/pages/UserProfile"));
const EditorConfig = lazy(() => import("setting/pages/EditorConfig"));
const Website = lazy(() => import("setting/pages/Website"));

export const settingRoutes = {
  path: "settings",
  children: [
    createRoute(`${USER_PROFILE_ROUTE}`, <UserProfile />),
    createRoute(EDITOR_CONFIG, <EditorConfig />),
    createRoute("sync", <Sync />),
    createRoute("account", <AccountSettings />),
    createRoute("website", <Website />),
  ],
};
