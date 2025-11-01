// app/web/generatorRoutes.tsx
import React, { lazy, Suspense } from "react";
import { authRoutes } from "auth/web/routes";
import { createRoutes } from "create/routes";
import { settingRoutes } from "app/settings/routes";
import { lifeRoutes } from "life/routes";

// 懒加载 PageLoader，避免它及其依赖链进入首页首包
const PageLoader = lazy(() => import("render/page/PageLoader"));

const Fallback = (
  <div
    style={{ padding: 40, textAlign: "center", color: "var(--textSecondary)" }}
  >
    加载中...
  </div>
);

export const commonRoutes = [
  ...authRoutes,
  ...createRoutes,
  settingRoutes, // 若它是数组改为 ...settingRoutes
  ...lifeRoutes,
  // 动态页面路由放最后；用 Suspense 包裹懒加载的 PageLoader
  {
    path: ":pageKey",
    element: (
      <Suspense fallback={Fallback}>
        <PageLoader />
      </Suspense>
    ),
  },
  // 最后可加 404
  // { path: "*", element: <NotFoundPage /> },
];
