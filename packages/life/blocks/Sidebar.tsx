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
import { useFetchData } from "../hooks/useFetchData";
import { useAuth } from "app/hooks";

import { NavLink } from "react-router-dom";
const buttonBaseClass =
  "w-full flex items-center p-2 mb-2 text-sm font-medium rounded-md transition-colors ease-snappy hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-400";
const iconClass = "text-neutral-600 mr-2";
const activeClass = "bg-neutral-300";

export const Sidebar = () => {
  const { fetchData } = useFetchData();
  const auth = useAuth();
  useEffect(() => {
    auth.user?.userId && fetchData(auth.user?.userId);
  }, [auth.user?.userId]);
  const getNavLinkClass = ({ isActive }) =>
    clsx(buttonBaseClass, isActive && activeClass);

  return (
    <div className="min-h-full w-48 overflow-y-auto bg-neutral-100">
      <div className="flex flex-col justify-between p-4">
        <nav>
          <NavLink to="/life/all" className={getNavLinkClass}>
            <DatabaseIcon size={20} className={iconClass} />
            <span>All</span>
          </NavLink>
          <NavLink to="/life/notes" className={getNavLinkClass}>
            <FileMediaIcon size={24} />
            <span>Medias</span>
          </NavLink>

          <NavLink to="/life/notes" className={getNavLinkClass}>
            <NoteIcon size={20} className={iconClass} />
            <span>Notes</span>
          </NavLink>
          <NavLink to="/life/calendar" className={getNavLinkClass}>
            <CalendarIcon size={20} className={iconClass} />
            <span>Calendar</span>
          </NavLink>
          <button type="button" className={clsx(buttonBaseClass)}>
            <FileIcon size={20} className={iconClass} />
            Files
          </button>
          <button type="button" className={clsx(buttonBaseClass)}>
            <TasklistIcon size={20} className={iconClass} />
            Tasks
          </button>

          <NavLink to="/life/statistics" className={getNavLinkClass}>
            <GraphIcon size={20} className={iconClass} />
            <span>统计</span>
          </NavLink>
          <NavLink to="/life/archive" className={getNavLinkClass}>
            <ArchiveIcon size={20} className={iconClass} />
            <span>Archive</span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
