import { useTheme } from "app/theme";
import type React from "react";
import { NavLink } from "react-router-dom";

interface NavIconItemProps {
  path?: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const styles = {
  size: "32px",
  borderRadius: "6px",
  transition: "all 0.2s ease",
};

const NavIconItem: React.FC<NavIconItemProps> = ({ path, icon, onClick }) => {
  const theme = useTheme();
  return (
    <>
      <style>
        {`
          .nav-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: ${styles.size};
            height: ${styles.size};
            padding: 0;
            border-radius: ${styles.borderRadius};
            background: transparent;
            color: ${theme.textSecondary};
            cursor: pointer;
            transition: ${styles.transition};
            text-decoration: none;
          }

          .nav-icon:hover {
            color: ${theme.primary};
            background: ${theme.primaryGhost};
          }

          .nav-icon.active {
            background: ${theme.primary};
            color: white;
          }

          @media (prefers-reduced-motion: reduce) {
            .nav-icon {
              transition: none;
            }
          }
        `}
      </style>

      {onClick ? (
        <div className="nav-icon" onClick={onClick}>
          {icon}
        </div>
      ) : path ? (
        <NavLink
          to={path}
          className={({ isActive }) => `nav-icon ${isActive ? "active" : ""}`}
        >
          {icon}
        </NavLink>
      ) : null}
    </>
  );
};

export default NavIconItem;
