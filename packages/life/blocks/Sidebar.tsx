import {
  NoteIcon,
  CalendarIcon,
  FileIcon,
  TasklistIcon,
  GraphIcon,
} from '@primer/octicons-react';
import clsx from 'clsx';
import React from 'react';
import { NavLink } from 'react-router-dom';
const buttonBaseClass =
  'w-full flex items-center p-2 mb-2 text-sm font-medium rounded-md transition-colors ease-snappy hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-400';
const iconClass = 'text-neutral-600 mr-2';
const activeClass = 'bg-neutral-300';

export const Sidebar = () => {
  const getNavLinkClass = ({ isActive }) =>
    clsx(buttonBaseClass, isActive && activeClass);
  return (
    <div className="w-48 min-h-full bg-neutral-100 overflow-y-auto">
      <div className="flex flex-col justify-between p-4">
        <nav>
          <NavLink to="/life/notes" className={getNavLinkClass}>
            <NoteIcon size={20} className={iconClass} />
            <span>Notes</span>
          </NavLink>
          {/* Menu Item 2 */}
          <button className={clsx(buttonBaseClass)}>
            <CalendarIcon size={20} className={iconClass} />
            Calendar
          </button>
          {/* Menu Item 3 */}
          <button className={clsx(buttonBaseClass)}>
            <FileIcon size={20} className={iconClass} />
            Files
          </button>
          {/* Menu Item 4 */}
          <button className={clsx(buttonBaseClass)}>
            <TasklistIcon size={20} className={iconClass} />
            Tasks
          </button>

          <NavLink to="/life/statistics" className={getNavLinkClass}>
            <GraphIcon size={20} className={iconClass} />
            <span>统计</span>
          </NavLink>
        </nav>
        <div>{/* Settings or other items */}</div>
      </div>
    </div>
  );
};

export default Sidebar;
