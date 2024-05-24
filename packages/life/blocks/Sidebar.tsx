import {
  ArchiveIcon,
  CalendarIcon,
  DatabaseIcon,
  FileIcon,
  GraphIcon,
  NoteIcon,
  TasklistIcon,
  FileMediaIcon,
} from "@primer/octicons-react";
import clsx from "clsx";
import React, { useEffect } from "react";

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

      <NavLink to="/life/notes" className={getNavLinkClass}>
        <button>
          <FileMediaIcon size={24} />
          <span>Medias</span>
        </button>
      </NavLink>
      <NavLink to="/life/notes" className={getNavLinkClass}>
        <button>
          <NoteIcon size={20} />
          <span>Notes</span>
        </button>
      </NavLink>
      <NavLink to="/life/calendar" className={getNavLinkClass}>
        <button>
          <CalendarIcon size={20} />
          <span>Calendar</span>
        </button>
      </NavLink>
      <button type="button" className={clsx(buttonBaseClass)}>
        <FileIcon size={20} />
        Files
      </button>
      <button type="button" className={clsx(buttonBaseClass)}>
        <TasklistIcon size={20} />
        Tasks
      </button>

      <NavLink to="/life/statistics" className={getNavLinkClass}>
        <button>
          <GraphIcon size={20} />
          <span>统计</span>
        </button>
      </NavLink>
      <NavLink to="/life/archive" className={getNavLinkClass}>
        <button>
          <ArchiveIcon size={20} />
          <span>Archive</span>
        </button>
      </NavLink>
    </div>
  );
};

export default Sidebar;
