// routes.jsx
import Home from "app/pages/Home";
import Lab from "app/pages/Lab";
import { Suspense, lazy } from "react"; // Suspense 和 lazy 已存在
import MainLayout from "render/layout/MainLayout";
import { commonRoutes } from "./generatorRoutes";
import { spaceRoutes } from "create/space/routes";

const PricePage = lazy(() => import("app/pages/Price"));
const Models = lazy(() => import("ai/cybot/web/Models"));
// 添加 RechargePage 组件的惰性加载
const RechargePage = lazy(() => import("app/pages/Recharge")); // 假设您的充值页面组件路径是 'app/pages/Recharge'

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
      // 添加 /recharge 路由
      {
        path: "recharge", // 路由路径与 GuideSection 中的 link 保持一致
        element: (
          <Suspense>
            <RechargePage /> {/* 渲染 RechargePage 组件 */}
          </Suspense>
        ),
      },
      spaceRoutes,
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
