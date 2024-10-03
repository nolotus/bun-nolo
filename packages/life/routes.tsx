// routes/life.tsx
import React from "react";
import LazyLoadComponent from "render/components/LazyLoadComponent";
import { Outlet, NavLink } from "react-router-dom";
import { CalendarIcon, DatabaseIcon, GraphIcon } from "@primer/octicons-react";
import { PageLoader } from "render/blocks/PageLoader";
import Sidebar from "render/layout/Sidebar";

export enum LifeRoutePaths {
  STATISTICS = "life/statistics",
}

const Database = (
  <LazyLoadComponent
    factory={() => import("./web/Database")}
    fallback={<PageLoader />}
  />
);
const Statistics = (
  <LazyLoadComponent
    factory={() => import("./web/Statistics")}
    fallback={<PageLoader />}
  />
);

const Calendar = (
  <LazyLoadComponent
    factory={() => import("./web/Calendar")}
    fallback={<PageLoader />}
  />
);

const LifeLayout = () => {
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

  const sidebarContent = (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <NavLink
        to="/life"
        style={({ isActive }) => (isActive ? activeStyle : navLinkStyle)}
        end
      >
        <DatabaseIcon size={20} style={{ marginRight: "8px" }} />
        <span>database</span>
      </NavLink>

      <NavLink
        to="/life/calendar"
        style={({ isActive }) => (isActive ? activeStyle : navLinkStyle)}
      >
        <CalendarIcon size={20} style={{ marginRight: "8px" }} />
        <span>Calendar</span>
      </NavLink>
      <NavLink
        to="/life/statistics"
        style={({ isActive }) => (isActive ? activeStyle : navLinkStyle)}
      >
        <GraphIcon size={20} style={{ marginRight: "8px" }} />
        <span>统计</span>
      </NavLink>
    </div>
  );

  return (
    <Sidebar sidebarContent={sidebarContent}>
      <Outlet />
    </Sidebar>
  );
};

export const routes = {
  path: "/life",
  element: <LifeLayout />,
  children: [
    { index: true, element: Database },
    { path: "statistics", element: Statistics },
    { path: "calendar", element: Calendar },
  ],
};
