// 文件路径: app/web/routes.jsx
import Home from "app/pages/Home";
import Lab from "app/pages/Lab";
import { Suspense, lazy } from "react";
import MainLayout from "render/layout/MainLayout";
import { spaceRoutes } from "create/space/routes";

import { commonRoutes } from "./generatorRoutes";
const PricePage = lazy(() => import("app/pages/Pricing/Price"));
const AgentExplore = lazy(() => import("ai/agent/web/AgentExplore"));
const RechargePage = lazy(() => import("app/pages/Recharge"));

export const routes = (currentUser: any) => [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      ...commonRoutes,
      {
        index: true,
        element: <Home />,
      },
      {
        path: "lab",
        element: <Lab />,
      },
      {
        path: "pricing",
        element: <PricePage />,
      },
      {
        path: "recharge",
        element: (
          <Suspense>
            <RechargePage />
          </Suspense>
        ),
      },
      spaceRoutes,
      {
        path: "explore",
        element: (
          <Suspense>
            <AgentExplore />
          </Suspense>
        ),
      },
    ],
  },
];
