import type React from "react";
import { NavLink } from "react-router-dom";

interface NavListItemProps {
  path?: string;
  label?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

const NavListItem: React.FC<NavListItemProps> = ({
  path,
  label,
  icon,
  onClick,
}) => {
  return (
    <>
      <style>
        {`
          .nav-list-item {
            display: flex;
            align-items: center;
            padding: 0 var(--space-3);
            border-radius: 6px;
            color: var(--text);
            background: transparent;
            text-decoration: none;
            transition: all 0.2s ease;
            cursor: pointer;
            font-weight: 400;
            height: 32px;
            font-size: 14px;
          }

          .nav-list-icon {
            display: flex;
            align-items: center;
            margin-right: var(--space-2);
            color: var(--textSecondary);
          }

          .nav-list-item:hover {
            color: var(--primary);
            background: var(--primaryGhost);
          }

          .nav-list-item:hover .nav-list-icon {
            color: var(--primary);
          }

          .nav-list-item.active {
            background: var(--primary);
            color: var(--background);
          }

          .nav-list-item.active .nav-list-icon {
            color: var(--background);
          }

          @media (prefers-reduced-motion: reduce) {
            .nav-list-item {
              transition: none;
            }
          }
        `}
      </style>

      {onClick ? (
        <div onClick={onClick} className="nav-list-item">
          {icon && <span className="nav-list-icon">{icon}</span>}
          {label}
        </div>
      ) : path ? (
        <NavLink
          to={path}
          className={({ isActive }) =>
            `nav-list-item ${isActive ? "active" : ""}`
          }
        >
          {icon && <span className="nav-list-icon">{icon}</span>}
          {label}
        </NavLink>
      ) : null}
    </>
  );
};

export default NavListItem;
