// routes.jsx
import Home from "app/pages/Home";
import Lab from "app/pages/Lab";
import { Suspense, lazy } from "react";
import MainLayout from "render/layout/MainLayout";
import { commonRoutes } from "./generatorRoutes";
import SpaceLayout from "create/space/components/SpaceLayout";
import SpaceHome from "create/space/pages/SpaceHome";
import SpaceSettings from "create/space/pages/SpaceSettings";
import SpaceMembers from "create/space/pages/SpaceMembers";

const PricePage = lazy(() => import("app/pages/Price"));
const Models = lazy(() => import("ai/cybot/web/Models"));

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
      // 空间相关路由使用嵌套布局
      {
        path: "space/:spaceId",
        element: <SpaceLayout />,
        children: [
          {
            index: true,
            element: <SpaceHome />,
          },
          {
            path: "settings",
            element: <SpaceSettings />,
          },
          {
            path: "members",
            element: <SpaceMembers />,
          },
          {
            path: "files",
            element: <SpaceHome />, // 目前与首页相同，之后可以替换为专用文件页面
          },
        ],
      },
      {
        path: "explore",
        element: (
          <Suspense>
            <Models />
          </Suspense>
        ),
      },
    ],
  },
];
