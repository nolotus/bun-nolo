import React, { Suspense, lazy } from "react";
import Home from "app/pages/Home";
import MainLayout from "render/layout/MainLayout";
import { spaceRoutes } from "create/space/routes";

import { authRoutes } from "auth/web/routes";
import { createRoutes } from "create/routes";
import { settingRoutes } from "app/settings/routes";
import { lifeRoutes } from "life/routes";
import PageLoader from "render/page/PageLoader";

const Lab = lazy(() => import("app/pages/Lab"));
const PricePage = lazy(() => import("app/pages/Pricing/Price"));
const RechargePage = lazy(() => import("app/pages/Recharge"));
const AgentExplore = lazy(() => import("ai/agent/web/AgentExplore"));

const fallbackStyle = {
  padding: 40,
  textAlign: "center",
  color: "var(--textSecondary)",
} as const;

const withSuspense = (element: JSX.Element) => (
  <Suspense fallback={<div style={fallbackStyle}>加载中...</div>}>
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
