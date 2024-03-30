import React, { Suspense, lazy } from "react";
import Layout from "render/layout/Full";

const LazyLoadWrapper = ({ component }) => (
  <Suspense fallback={<>加载中...</>}>{component}</Suspense>
);

const Setting = lazy(() => import("./index"));
const Network = lazy(() => import("./pages/Network"));
const Sync = lazy(() => import("./pages/Sync"));
const PluginSettings = lazy(() => import("./pages/PluginSettings"));
// 添加导入和导出的懒加载组件
const ImportSettings = lazy(() => import("./pages/ImportSettings"));
const ExportSettings = lazy(() => import("./pages/ExportSettings"));
const AccountSettings = lazy(() => import("./pages/AccountSettings"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const ExtendedProfile = lazy(() => import("./pages/ExtendedProfile"));
const ServiceProviderSettings = lazy(
  () => import("./pages/ServiceProviderSettings"),
);
const EditorConfig = lazy(() => import("./pages/EditorConfig"));
// routeNames.ts
export const USER_PROFILE_ROUTE = "user-profile";
export const EDITOR_CONFIG = "editor-config";
export const EXTENDED_PROFILE_ROUTE = "personal-interests";

const createRoute = (path, component) => ({
  path,
  element: <LazyLoadWrapper component={component} />,
});

export const routes = {
  path: "/",
  element: <Layout />,
  children: [
    {
      path: "settings",
      element: <LazyLoadWrapper component={<Setting />} />,
      children: [
        createRoute(USER_PROFILE_ROUTE, <UserProfile />),
        createRoute(EDITOR_CONFIG, <EditorConfig />),
        createRoute("network", <Network />),
        createRoute("sync", <Sync />),
        createRoute("plugins", <PluginSettings />),
        // 添加导入和导出的路由
        createRoute("import", <ImportSettings />),
        createRoute("export", <ExportSettings />),
        createRoute("account", <AccountSettings />),
        createRoute(EXTENDED_PROFILE_ROUTE, <ExtendedProfile />),
        // 添加服务商设置的路由
        createRoute("service-provider", <ServiceProviderSettings />),
      ],
    },
  ],
};
