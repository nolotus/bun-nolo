// SettingsSidebarContent.tsx
import React from "react";
import { nolotusId } from "core/init";
import { useAuth } from "auth/hooks/useAuth";
import NavListItem from "render/layout/blocks/NavListItem";
import { SettingRoutePaths } from "./config";

const navItems = [
  { path: SettingRoutePaths.SETTING_USER_PROFILE, label: "个人资料" },
  { path: SettingRoutePaths.SETTING_EDITOR_CONFIG, label: "编辑器设置" },
  { path: SettingRoutePaths.SETTING_CUSTOMIZE, label: "个性化设置" },
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
