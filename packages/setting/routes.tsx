import React, { Suspense, lazy } from "react";
import Layout from "render/layout/Full";

const LazyLoadWrapper = ({ component }) => (
  <Suspense fallback={<>加载中...</>}>{component}</Suspense>
);

const Setting = lazy(() => import("./index"));
const Sync = lazy(() => import("./pages/Sync"));
// const PluginSettings = lazy(() => import("./pages/PluginSettings"));
const ExportSettings = lazy(() => import("./pages/ExportSettings"));
const AccountSettings = lazy(() => import("./pages/AccountSettings"));
const UserProfile = lazy(() => import("./pages/UserProfile"));

const EditorConfig = lazy(() => import("./pages/EditorConfig"));
const Website = lazy(() => import("./pages/Website"));

// routeNames.ts
export const USER_PROFILE_ROUTE = "user-profile";
export const EDITOR_CONFIG = "editor-config";

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
        createRoute("sync", <Sync />),
        // createRoute("plugins", <PluginSettings />),
        createRoute("export", <ExportSettings />),
        createRoute("account", <AccountSettings />),
        createRoute("website", <Website />),
      ],
    },
  ],
};
