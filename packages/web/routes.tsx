import Home from "app/pages/Home";
import Lab from "app/pages/Lab";
import { Suspense, lazy } from "react";
import MainLayout from "render/layout/MainLayout";

import { SurfTip } from "./SurfTip";
import { commonRoutes } from "./generatorRoutes";
import SpaceSettings from "create/space/pages/SpaceSettings";
import SpaceHome from "create/space/pages/SpaceHome";
const PricePage = lazy(() => import("app/pages/Price"));
// 修改 Models 页面导入路径
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
        path: "price",
        element: <PricePage />,
      },
      {
        path: "surfing-safety-tips",
        element: <SurfTip />,
      },
      // 空间首页
      {
        path: "space/:spaceId",
        element: <SpaceHome />,
      },
      // 空间设置页面
      {
        path: "space/:spaceId/settings",
        element: <SpaceSettings />,
      },
      // 添加独立的 models 页面
      {
        path: "models",
        element: (
          <Suspense>
            <Models />
          </Suspense>
        ),
      },
    ],
  },
];
