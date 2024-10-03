import React, { Suspense, lazy } from "react";
import Sizes from "open-props/src/sizes";
import { Outlet, Link } from "react-router-dom";
import { nolotusId } from "core/init";
import { useAuth } from "auth/useAuth";
import { USER_PROFILE_ROUTE, EDITOR_CONFIG } from "./config";
import Sidebar from "render/layout/Sidebar";

const allowedUserIds = [nolotusId];

const navItems = [
  { path: `/settings/${USER_PROFILE_ROUTE}`, label: "个人资料" },
  { path: `/settings/${EDITOR_CONFIG}`, label: "编辑器设置" },
  { path: "/settings/sync", label: "同步设置" },
  { path: "/settings/account", label: "账号设置" },
  { path: "/settings/website", label: "网站设置" },
  { path: "/settings/customize", label: "个性化设置" },
];

const Layout = () => {
  const auth = useAuth();

  const couldDisplay = (item) => {
    if (item.label === "服务商设置") {
      if (auth.user) {
        if (allowedUserIds.includes(auth.user?.userId)) {
          return true;
        }
      }
      return false;
    }
    return true;
  };

  const sidebarContent = (
    <nav
      style={{
        display: "flex",
        flexDirection: "column",
        gap: Sizes["--size-1"],
      }}
    >
      {navItems.map((item) => {
        const isDisplay = couldDisplay(item);
        return isDisplay ? (
          <Link
            key={item.label}
            to={item.path}
            className="text-black"
            style={{ fontWeight: "bold" }}
          >
            {item.label}
          </Link>
        ) : null;
      })}
    </nav>
  );

  return (
    <Sidebar sidebarContent={sidebarContent}>
      <Outlet />
    </Sidebar>
  );
};

const LazyLoadWrapper = ({ component }) => (
  <Suspense fallback={<>加载中...</>}>{component}</Suspense>
);

const Sync = lazy(() => import("./pages/Sync"));
const AccountSettings = lazy(() => import("./pages/AccountSettings"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const EditorConfig = lazy(() => import("./pages/EditorConfig"));
const Website = lazy(() => import("./pages/Website"));

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
      children: [
        createRoute(USER_PROFILE_ROUTE, <UserProfile />),
        createRoute(EDITOR_CONFIG, <EditorConfig />),
        createRoute("sync", <Sync />),
        createRoute("account", <AccountSettings />),
        createRoute("website", <Website />),
      ],
    },
  ],
};
