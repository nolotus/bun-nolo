import React, { Suspense, lazy } from "react";
import { authRoutes } from "auth/client/routes";
import MainLayout from "render/layout/MainLayout";
import Home from "app/pages/Home";
import Lab from "app/pages/Lab";
import { settingRoutes } from "setting/routes";
import { createRoutes } from "create/routes";

import { createLazyRoute } from "./createLazyRoute";
import { SurfTip } from "./SurfTip";

const Page = lazy(() => import("render/page/PageIndex"));

const PricePage = lazy(() => import("app/pages/Price"));

export const routes = (currentUser: any) => [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      ...authRoutes,
      ...createRoutes,
      settingRoutes,
      {
        path: "/life",
        children: [
          createLazyRoute("/life", () => import("life/web/Database")),
          createLazyRoute(
            "/life/statistics",
            () => import("life/web/Statistics"),
          ),
          createLazyRoute("/life/calendar", () => import("life/web/Calendar")),
        ],
      },
      {
        index: true,
        element: <Home />,
      },
      {
        path: "lab",
        element: <Lab />,
      },
      {
        path: "price",
        element: <PricePage />,
      },
      { path: "surfing-safety-tips", element: <SurfTip /> },
      // 设置路由
      {
        path: "/chat",
        children: [
          createLazyRoute("/chat", () => import("chat/ChatGuide")),
          createLazyRoute("/chat/:dialogId", () => import("chat/ChatPage")),
        ],
      },
    ],
  },
  {
    path: ":pageId",
    element: (
      <Suspense>
        <Page />
      </Suspense>
    ),
  },
];
