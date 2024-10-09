import React from "react";
import { useLocation, Link } from "react-router-dom";
import Sidebar from "render/layout/Sidebar";
import Default from "render/layout/Default";
import Sizes from "open-props/src/sizes";
import { USER_PROFILE_ROUTE, EDITOR_CONFIG } from "setting/config";
import { nolotusId } from "core/init";
import NavListItem from "./blocks/NavListItem";
import { BeakerIcon } from "@primer/octicons-react";
import { allowRule, NavItem } from "auth/navPermissions";
import { useAuth } from "auth/useAuth";

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

  return (
    <Sidebar
      sidebarContent={
        isSettingsPage ? settingsSidebarContent : defaultSidebarContent
      }
    >
      <Default />
    </Sidebar>
  );
};

export default MainLayout;
