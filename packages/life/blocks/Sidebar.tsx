import {
	ArchiveIcon,
	CalendarIcon,
	DatabaseIcon,
	FileIcon,
	GraphIcon,
	NoteIcon,
	ProjectIcon,
	TasklistIcon,
} from "@primer/octicons-react";
import clsx from "clsx";
import React from "react";
import { NavLink } from "react-router-dom";
const buttonBaseClass =
	"w-full flex items-center p-2 mb-2 text-sm font-medium rounded-md transition-colors ease-snappy hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-400";
const iconClass = "text-neutral-600 mr-2";
const activeClass = "bg-neutral-300";

export const Sidebar = () => {
	const getNavLinkClass = ({ isActive }) =>
		clsx(buttonBaseClass, isActive && activeClass);
	return (
		<div className="w-48 min-h-full bg-neutral-100 overflow-y-auto">
			<div className="flex flex-col justify-between p-4">
				<nav>
					<NavLink to="/life/dashboard" className={getNavLinkClass}>
						<ProjectIcon size={20} className={iconClass} />
						<span>Projects</span>
					</NavLink>
					<NavLink to="/life/all" className={getNavLinkClass}>
						<DatabaseIcon size={20} className={iconClass} />
						<span>All</span>
					</NavLink>
					<NavLink to="/life/notes" className={getNavLinkClass}>
						<NoteIcon size={20} className={iconClass} />
						<span>Notes</span>
					</NavLink>
					<NavLink to="/life/calendar" className={getNavLinkClass}>
						<CalendarIcon size={20} className={iconClass} />
						<span>Calendar</span>
					</NavLink>
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
