import type React from "react";
import { Suspense, lazy } from "react";
import { PageLoader } from "render/blocks/PageLoader";

const LazyLoadWrapper = ({ component }: { component: React.ReactNode }) => (
  <Suspense fallback={<PageLoader />}>{component}</Suspense>
);

// 共享的懒加载组件（前两个路由使用相同模块）
const LazyUsage = lazy(() => import("life/web/Usage"));
const LazyUsersPage = lazy(() => import("auth/web/UsersPage"));

export const lifeRoutes = [
  {
    path: "/life",
    element: <LazyLoadWrapper component={<LazyUsage />} />,
  },
  {
    path: "/life/usage",
    element: <LazyLoadWrapper component={<LazyUsage />} />,
  },
  {
    path: "/life/users", // 已添加 "/" 以符合标准路由路径；如需调整请告知
    element: <LazyLoadWrapper component={<LazyUsersPage />} />,
  },
];
