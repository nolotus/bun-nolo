import React, { Suspense, lazy } from "react"; // 引入 React 和 lazy

import { authRoutes } from "auth/web/routes"; // 确认路径正确
import { createRoutes } from "create/routes"; // 确认路径正确
import { settingRoutes } from "setting/routes"; // 确认路径正确
import { lifeRoutes } from "life/routes"; // 确认路径正确
// import { chatRoutes } from "chat/routes"; // 如果有聊天路由

// 懒加载 PageLoader 组件
const PageLoader = lazy(() => import("render/page/PageLoader")); // 确认路径正确

// hostRoutesMap 和 generatorRoutes (根据你的需要保留或修改)
const hostRoutesMap = {
  /* ... */
};
export const generatorRoutes = (host: string) => {
  /* ... */
};

// 简单的加载提示组件
const LoadingFallback = () => (
  <div style={{ padding: "40px", textAlign: "center" }}>加载中...</div>
);

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
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <PageLoader /> {/* 渲染 PageLoader 组件 */}
      </Suspense>
    ),
  },
  // 可以添加一个 404 路由在最后
  // { path: "*", element: <NotFoundPage /> },
];
