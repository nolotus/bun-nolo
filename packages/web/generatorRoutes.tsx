import React from "react";

import { authRoutes } from "auth/web/routes";
import { createRoutes } from "create/routes";
import { settingRoutes } from "setting/routes";
import { lifeRoutes } from "life/routes";
// import { chatRoutes } from "chat/routes"; // 如果有聊天路由

// 直接导入 PageLoader 组件
import PageLoader from "render/page/PageLoader";

// hostRoutesMap 和 generatorRoutes (根据你的需要保留或修改)
const hostRoutesMap = {
  /* ... */
};
export const generatorRoutes = (host: string) => {
  /* ... */
};

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
