// SettingsSidebarContent.tsx
import React from "react";
import { USER_PROFILE_ROUTE, EDITOR_CONFIG } from "setting/config";
import { nolotusId } from "core/init";
import { useAuth } from "auth/useAuth";
import NavListItem from "render/layout/blocks/NavListItem";

const navItems = [
  { path: `/settings/${USER_PROFILE_ROUTE}`, label: "个人资料" },
  { path: `/settings/${EDITOR_CONFIG}`, label: "编辑器设置" },
  { path: "/settings/sync", label: "同步设置" },
  { path: "/settings/account", label: "账号设置" },
  { path: "/settings/website", label: "网站设置" },
  { path: "/settings/customize", label: "个性化设置" },
];

const allowedUserIds = [nolotusId];

const SettingsSidebarContent: React.FC = () => {
  const auth = useAuth();

  const couldDisplay = (item: { label: string }) => {
    if (item.label === "服务商设置") {
      return auth.user && allowedUserIds.includes(auth.user?.userId);
    }
    return true;
  };

  return (
    <nav
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      {navItems.map((item) => {
        const isDisplay = couldDisplay(item);
        return isDisplay ? (
          <NavListItem key={item.label} path={item.path} label={item.label} />
        ) : null;
      })}
    </nav>
  );
};

export default SettingsSidebarContent;
