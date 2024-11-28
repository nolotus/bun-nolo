// SettingLayout.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import SettingsSidebarContent from "./SettingsSidebarContent";

const SettingLayout: React.FC = () => {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: 200, padding: "0 20px" }}>
        <SettingsSidebarContent />
      </div>
      <div style={{ flex: 1, padding: 20 }}>
        <Outlet />
      </div>
    </div>
  );
};

export default SettingLayout;
