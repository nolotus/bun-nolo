// setting/SettingsSidebarContent.tsx
import React from "react";
import NavListItem from "render/layout/blocks/NavListItem";
import { SettingRoutePaths } from "./config";

const navItems = [
  { path: SettingRoutePaths.SETTING_USER_PROFILE, label: "个人资料" },
  { path: SettingRoutePaths.SETTING_EDITOR_CONFIG, label: "编辑器设置" },
];

const SettingsSidebarContent: React.FC = () => {
  return (
    <nav
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      {navItems.map((item) => {
        return (
          <NavListItem key={item.label} path={item.path} label={item.label} />
        );
      })}
    </nav>
  );
};

export default SettingsSidebarContent;
