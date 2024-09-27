import {
  CalendarIcon,
  DatabaseIcon,
  GraphIcon,
  NoteIcon,
} from "@primer/octicons-react";
import clsx from "clsx";
import React from "react";

import { NavLink } from "react-router-dom";
const buttonBaseClass = "w-full flex";
const activeClass = "bg-neutral-300";

export const Sidebar = () => {
  const getNavLinkClass = ({ isActive }) =>
    clsx(buttonBaseClass, isActive && activeClass);
  return (
    <div className="flex flex-col  p-4" style={{ gap: "12px" }}>
      <NavLink to="/life/database" className={getNavLinkClass}>
        <button>
          <DatabaseIcon size={20} />
          <span>database</span>
        </button>
      </NavLink>

      <NavLink to="/life/all" className={getNavLinkClass}>
        <button>
          <DatabaseIcon size={20} />
          <span>All</span>
        </button>
      </NavLink>

      <NavLink to="/life/calendar" className={getNavLinkClass}>
        <button>
          <CalendarIcon size={20} />
          <span>Calendar</span>
        </button>
      </NavLink>
      <NavLink to="/life/statistics" className={getNavLinkClass}>
        <button>
          <GraphIcon size={20} />
          <span>统计</span>
        </button>
      </NavLink>
    </div>
  );
};

export default Sidebar;
