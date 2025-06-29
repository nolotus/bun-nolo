import React from "react";

import { authRoutes } from "auth/web/routes";
import { createRoutes } from "create/routes";
import { settingRoutes } from "app/settings/routes";
import { lifeRoutes } from "life/routes";

import PageLoader from "render/page/PageLoader";

// --- commonRoutes ---
export const commonRoutes = [
  ...authRoutes,
  ...createRoutes,
  settingRoutes,
  ...lifeRoutes,
  // ...pluginRoutes, // 如果有插件路由

  // 动态页面路由放最后
  {
    path: ":pageKey", // 使用 :pageKey 作为路径参数
    element: <PageLoader />, // 直接渲染 PageLoader 组件
  },
  // 可以添加一个 404 路由在最后
  // { path: "*", element: <NotFoundPage /> },
];
