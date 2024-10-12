import React, { Suspense } from "react";
import { useLocation, Link, Outlet } from "react-router-dom";
import Sidebar from "render/layout/Sidebar";
import Sizes from "open-props/src/sizes";
import { USER_PROFILE_ROUTE, EDITOR_CONFIG } from "setting/config";
import { nolotusId } from "core/init";
import { BeakerIcon } from "@primer/octicons-react";
import { allowRule, NavItem } from "auth/navPermissions";
import { useAuth } from "auth/useAuth";
import ChatSidebar from "chat/ChatSidebar";
import { AnimatePresence, motion } from "framer-motion";

import NavListItem from "./blocks/NavListItem";

export const bottomLinks: NavItem[] = [
  {
    path: "/lab",
    label: "Lab",
    icon: <BeakerIcon size={16} />,
    allow_users: [nolotusId],
  },
];

const navItems = [
  { path: `/settings/${USER_PROFILE_ROUTE}`, label: "个人资料" },
  { path: `/settings/${EDITOR_CONFIG}`, label: "编辑器设置" },
  { path: "/settings/sync", label: "同步设置" },
  { path: "/settings/account", label: "账号设置" },
  { path: "/settings/website", label: "网站设置" },
  { path: "/settings/customize", label: "个性化设置" },
];

const allowedUserIds = [nolotusId];

const MainLayout: React.FC = () => {
  const location = useLocation();
  const auth = useAuth();
  const isSettingsPage = location.pathname.startsWith("/settings");
  const isLifePage = location.pathname.startsWith("/life");
  const isChatPage = location.pathname.startsWith("/chat");
  const allowedBottomLinks = allowRule(auth?.user, bottomLinks);

  const couldDisplay = (item: { label: string }) => {
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

  const defaultSidebarContent = (
    <ul style={{ listStyleType: "none", padding: 0 }}>
      {allowedBottomLinks.map((item) => (
        <NavListItem key={item.path} {...item} />
      ))}
    </ul>
  );

  const settingsSidebarContent = (
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

  const getSidebarContent = () => {
    if (isSettingsPage || isLifePage) {
      return settingsSidebarContent;
    }
    if (isChatPage) {
      return <ChatSidebar />;
    }
    return defaultSidebarContent;
  };

  const isChatDetailPage =
    location.pathname.startsWith("/chat/") && location.pathname !== "/chat";

  const renderContent = () => {
    if (isChatDetailPage) {
      return <Outlet />;
    }

    return (
      <Suspense fallback={<div>loading</div>}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, visibility: "hidden" }}
            animate={{ opacity: 1, visibility: "visible" }}
            exit={{ opacity: 0, visibility: "hidden" }}
            transition={{ duration: 0.3, when: "beforeChildren" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </Suspense>
    );
  };

  return (
    <Sidebar sidebarContent={getSidebarContent()} fullWidth={isChatDetailPage}>
      {renderContent()}
    </Sidebar>
  );
};

export default MainLayout;
