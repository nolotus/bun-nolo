// life/LifeSidebarContent.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import { GraphIcon } from "@primer/octicons-react";
const LifeSidebarContent = () => {
  const navLinkStyle = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    padding: "8px",
    textDecoration: "none",
    color: "#333",
    marginBottom: "12px",
  };

  const activeStyle = {
    ...navLinkStyle,
    backgroundColor: "#d1d5db",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <NavLink
        to="/life/statistics"
        style={({ isActive }) => (isActive ? activeStyle : navLinkStyle)}
      >
        <GraphIcon size={20} style={{ marginRight: "8px" }} />
        <span>统计</span>
      </NavLink>
      <NavLink
        to="/life/usage"
        style={({ isActive }) => (isActive ? activeStyle : navLinkStyle)}
      >
        <GraphIcon size={20} style={{ marginRight: "8px" }} />
        <span>使用</span>
      </NavLink>
    </div>
  );
};

export default LifeSidebarContent;
