import React, { Suspense, lazy } from "react";
import Home from "app/pages/Home";
import MainLayout from "render/layout/MainLayout";
import { spaceRoutes } from "create/space/routes";

import { authRoutes } from "auth/web/routes";
import { createRoutes } from "create/routes";
import { settingRoutes } from "app/settings/routes";
import { lifeRoutes } from "life/routes";
import PageLoader from "render/page/PageLoader";

import PageLoading from "render/web/ui/PageLoading";

const Lab = lazy(() => import("app/pages/Lab"));
const PricePage = lazy(() => import("app/pages/Pricing/Price"));
const RechargePage = lazy(() => import("app/pages/Recharge"));
const AgentExplore = lazy(() => import("ai/agent/web/AgentExplore"));

/**
 * 统一的 Suspense 包装：
 * - 使用 PageLoading 作为 fallback
 * - message 会根据传入的 pageName 生成「在加载什么」
 */
const withSuspense = (element: JSX.Element, pageName?: string) => {
  const message = pageName ? `${pageName}加载中...` : "内容加载中，请稍候...";

  return (
    <Suspense fallback={<PageLoading fullHeight message={message} />}>
      {element}
    </Suspense>
  );
};

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

      // 按页面给出清晰的加载文案
      { path: "lab", element: withSuspense(<Lab />, "实验室页面") },
      {
        path: "pricing",
        element: withSuspense(<PricePage />, "定价与套餐信息"),
      },
      {
        path: "recharge",
        element: withSuspense(<RechargePage />, "充值页面"),
      },
      spaceRoutes,
      {
        path: "explore",
        element: withSuspense(<AgentExplore />, "智能体广场"),
      },
    ],
  },
];
