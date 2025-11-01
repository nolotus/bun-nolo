// app/web/routes.jsx
import React, { Suspense, lazy } from "react";
import Home from "app/pages/Home";
// import Lab from "app/pages/Lab"; // 移除直接导入
import MainLayout from "render/layout/MainLayout";
import { spaceRoutes } from "create/space/routes";
import { commonRoutes } from "./generatorRoutes";

const PricePage = lazy(() => import("app/pages/Pricing/Price"));
const AgentExplore = lazy(() => import("ai/agent/web/AgentExplore"));
const RechargePage = lazy(() => import("app/pages/Recharge"));
const Lab = lazy(() => import("app/pages/Lab")); // 新增：懒加载 Lab

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
      ...commonRoutes,
      { index: true, element: <Home /> },
      { path: "lab", element: withSuspense(<Lab />) }, // 使用懒加载的 Lab
      { path: "pricing", element: withSuspense(<PricePage />) },
      { path: "recharge", element: withSuspense(<RechargePage />) },
      spaceRoutes,
      { path: "explore", element: withSuspense(<AgentExplore />) },
    ],
  },
];
