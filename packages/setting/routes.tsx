import React from "react";
import { createLazyRoute } from "web/createLazyRoute";

import { USER_PROFILE_ROUTE, EDITOR_CONFIG } from "setting/config";

export const settingRoutes = {
  path: "settings",
  children: [
    createLazyRoute(
      `${USER_PROFILE_ROUTE}`,
      () => import("setting/pages/UserProfile"),
    ),
    createLazyRoute(EDITOR_CONFIG, () => import("setting/pages/EditorConfig")),
    createLazyRoute("sync", () => import("setting/pages/Sync")),
    createLazyRoute("account", () => import("setting/pages/AccountSettings")),
    createLazyRoute("website", () => import("setting/pages/Website")),
  ],
};
