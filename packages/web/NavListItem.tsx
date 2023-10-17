import React from "react";
import { NavLink } from "react-router-dom";

interface NavListItemProps {
  path: string;
  label: string;
  className: string;
}

const NavListItem: React.FC<NavListItemProps> = ({
  path,
  label,
  className,
}) => (
  <li className="my-2">
    <NavLink
      to={path}
      className={({ isActive }) =>
        `${className} px-3 py-2 rounded-lg font-bold hover:bg-blue-500 hover:text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200 ${
          isActive ? "bg-blue-500 text-white" : ""
        }`
      }
    >
      {label}
    </NavLink>
  </li>
);

export default NavListItem;
