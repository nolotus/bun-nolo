import type React from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "app/theme";

interface NavListItemProps {
  path?: string;
  label?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  size?: "default" | "large";
}

const NavListItem: React.FC<NavListItemProps> = ({
  path,
  label,
  icon,
  onClick,
  size = "default",
}) => {
  const height = size === "large" ? "48px" : "32px";
  const padding = size === "large" ? "0 var(--space-4)" : "0 var(--space-3)";
  const fontSize = size === "large" ? "16px" : "14px";
  const iconMargin = size === "large" ? "var(--space-3)" : "var(--space-2)";

  return (
    <>
      <style>
        {`
          .nav-list-item {
            display: flex;
            align-items: center;
            padding: ${padding};
            border-radius: 6px;
            color: var(--text);
            background: transparent;
            text-decoration: none;
            transition: all 0.2s ease;
            cursor: pointer;
            font-weight: 400;
            height: ${height};
            font-size: ${fontSize};
          }

          .nav-list-icon {
            display: flex;
            align-items: center;
            margin-right: ${iconMargin};
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
