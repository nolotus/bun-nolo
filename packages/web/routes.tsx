import React, { Suspense, lazy } from "react";
import { authRoutes } from "auth/client/routes";
import { routes as chatRoutes } from "chat/routes";
import { createRoutes } from "create/routes";
import { routes as lifeRoutes } from "life/routes";
import { USER_PROFILE_ROUTE, EDITOR_CONFIG } from "setting/config";
import MainLayout from "render/layout/MainLayout";
import Home from "app/pages/Home";
import Lab from "app/pages/Lab";
import { SurfTip } from "./SurfTip";

const Page = lazy(() => import("render/page/PageIndex"));
const Sync = lazy(() => import("setting/pages/Sync"));
const AccountSettings = lazy(() => import("setting/pages/AccountSettings"));
const UserProfile = lazy(() => import("setting/pages/UserProfile"));
const EditorConfig = lazy(() => import("setting/pages/EditorConfig"));
const Website = lazy(() => import("setting/pages/Website"));

const LazyLoadWrapper = ({ component }: { component: React.ReactNode }) => (
  <Suspense fallback={<>加载中...</>}>{component}</Suspense>
);

const createRoute = (path: string, component: React.ReactNode) => ({
  path,
  element: <LazyLoadWrapper component={component} />,
});

export const routes = (currentUser: any) => [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "lab",
        element: <Lab />,
      },
      ...authRoutes,
      ...createRoutes,
      {
        path: "price",
        element: (
          <Page id="000000100000-UWJFNG1GZUwzLVMzaWhjTzdnWmdrLVJ6d1d6Rm9FTnhYRUNXeFgyc3h6VQ-v9ziDvBB6UkWgFM_S2PV6" />
        ),
      },
      { path: "surfing-safety-tips", element: <SurfTip /> },
      // 设置路由
      {
        path: "settings",
        children: [
          createRoute(`${USER_PROFILE_ROUTE}`, <UserProfile />),
          createRoute(EDITOR_CONFIG, <EditorConfig />),
          createRoute("sync", <Sync />),
          createRoute("account", <AccountSettings />),
          createRoute("website", <Website />),
        ],
      },
    ],
  },
  chatRoutes,
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
