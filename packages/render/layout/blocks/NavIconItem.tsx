import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";
import { COLORS } from "../../styles/colors";

interface NavIconItemProps {
  path?: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

const NavIconItem: React.FC<NavIconItemProps> = ({ path, icon, onClick }) => {
  const theme = useSelector(selectTheme);

  const baseStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    color: COLORS.icon,
    textDecoration: "none",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    marginBottom: "12px",
  };

  return (
    <>
      <style>
        {`
          .nav-icon-item:hover {
            background-color: ${COLORS.primaryGhost};
            color: ${COLORS.primary};
            transform: translateY(-1px);
            box-shadow: 0 4px 12px ${COLORS.primaryGhost};
          }
          
          .nav-icon-item.active {
            background-color: ${COLORS.primary};
            color: ${COLORS.background} !important;
            box-shadow: 0 4px 12px ${COLORS.primaryLight}33;
          }

          .nav-icon-item.active svg {
            fill: ${COLORS.background};
            color: ${COLORS.background};
          }
        `}
      </style>

      {onClick ? (
        <div onClick={onClick} className="nav-icon-item" style={baseStyles}>
          {icon}
        </div>
      ) : path ? (
        <NavLink
          to={path}
          className={({ isActive }) =>
            `nav-icon-item ${isActive ? "active" : ""}`
          }
          style={baseStyles}
        >
          {icon}
        </NavLink>
      ) : null}
    </>
  );
};

export default NavIconItem;
