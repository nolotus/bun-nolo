// routes.tsx（示例文件名）
import React, { Suspense, lazy } from "react";
import Home from "app/pages/Home";
import MainLayout from "render/layout/MainLayout";
import { spaceRoutes } from "create/space/routes";

import { authRoutes } from "auth/web/routes";
import { createRoutes } from "create/routes";
import { settingRoutes } from "app/settings/routes";
import { lifeRoutes } from "life/routes";
import PageLoader from "render/page/PageLoader";

// 新增：使用统一的 PageLoading 组件
import PageLoading from "render/web/ui/PageLoading";

const Lab = lazy(() => import("app/pages/Lab"));
const PricePage = lazy(() => import("app/pages/Pricing/Price"));
const RechargePage = lazy(() => import("app/pages/Recharge"));
const AgentExplore = lazy(() => import("ai/agent/web/AgentExplore"));

// 删除原来的 fallbackStyle

const withSuspense = (element: JSX.Element, message?: string) => (
  <Suspense
    fallback={
      <PageLoading fullHeight message={message ?? "页面加载中，请稍候..."} />
    }
  >
    {element}
  </Suspense>
);

const commonRoutes = [
  ...authRoutes,
  ...createRoutes,
  settingRoutes,
  ...lifeRoutes,
  { path: ":pageKey", element: <PageLoader /> },
];

export const routes = () => [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      ...commonRoutes,
      { index: true, element: <Home /> },
      { path: "lab", element: withSuspense(<Lab />) },
      { path: "pricing", element: withSuspense(<PricePage />) },
      { path: "recharge", element: withSuspense(<RechargePage />) },
      spaceRoutes,
      { path: "explore", element: withSuspense(<AgentExplore />) },
    ],
  },
];
