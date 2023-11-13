import React from 'react';
import { NavLink } from 'react-router-dom';

interface NavListItemProps {
  path: string;
  label: string;
  icon?: JSX.Element;
  className?: string;
}

const NavListItem: React.FC<NavListItemProps> = ({
  path,
  label,
  icon,
  className,
}) => (
  <li>
    <NavLink
      to={path}
      className={({ isActive }) =>
        `block px-3 py-2 font-bold transition-all duration-200 ${
          isActive
            ? 'bg-sky-500 text-white'
            : 'text-gray-700 hover:bg-sky-500 hover:text-white'
        } ${className}`
      }
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </NavLink>
  </li>
);

export default NavListItem;
