// app/web/routes.jsx
import React, { Suspense, lazy } from "react";
import Home from "app/pages/Home";
import Lab from "app/pages/Lab";
import MainLayout from "render/layout/MainLayout";
import { spaceRoutes } from "create/space/routes";
import { commonRoutes } from "./generatorRoutes";

const PricePage = lazy(() => import("app/pages/Pricing/Price"));
const AgentExplore = lazy(() => import("ai/agent/web/AgentExplore"));
const RechargePage = lazy(() => import("app/pages/Recharge"));

const Fallback = (
  <div
    style={{ padding: 40, textAlign: "center", color: "var(--textSecondary)" }}
  >
    加载中...
  </div>
);
const withSuspense = (el: JSX.Element) => (
  <Suspense fallback={Fallback}>{el}</Suspense>
);

export const routes = (_currentUser?: any) => [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      ...commonRoutes, // 动态 :pageKey 在这里被懒加载
      { index: true, element: <Home /> },
      { path: "lab", element: <Lab /> },
      { path: "pricing", element: withSuspense(<PricePage />) },
      { path: "recharge", element: withSuspense(<RechargePage />) },
      spaceRoutes, // 若是数组改为 ...spaceRoutes
      { path: "explore", element: withSuspense(<AgentExplore />) },
    ],
  },
];
