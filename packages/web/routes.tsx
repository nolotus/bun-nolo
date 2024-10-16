import React, { Suspense, lazy } from "react";
import { authRoutes } from "auth/client/routes";
import { routes as lifeRoutes } from "life/routes";
import MainLayout from "render/layout/MainLayout";
import Home from "app/pages/Home";
import Lab from "app/pages/Lab";
import { settingRoutes } from "setting/routes";
import { SurfTip } from "./SurfTip";
import { createRoutes } from "create/routes";
import { createRoute } from "./createRoute";

const Page = lazy(() => import("render/page/PageIndex"));

const ChatPage = lazy(() => import("chat/ChatPage"));
const ChatGuide = lazy(() => import("chat/ChatGuide"));
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
          createRoute("/chat", <ChatGuide />),
          createRoute("/chat/:dialogId", <ChatPage />),
        ],
      },
    ],
  },

  lifeRoutes,
  {
    path: ":pageId",
    element: (
      <Suspense>
        <Page />
      </Suspense>
    ),
  },
];
