import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";
import { stylePresets } from "render/styles/stylePresets";

import { layout } from "render/styles/layout";
import { txt } from "render/styles/txt";
import { sizes } from "../../styles/sizes";

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
  const theme = useSelector(selectTheme);

  if (!theme) {
    throw new Error("Theme is not defined");
  }

  if (!stylePresets) {
    throw new Error("stylePresets is not defined");
  }

  const defaultStyle: React.CSSProperties = {
    ...layout.flex,
    ...layout.flexStart,
    ...stylePresets.transition,
    ...stylePresets.clickable,
    paddingTop: sizes.size1,
    paddingBottom: sizes.size1,
    paddingLeft: sizes.size2,
    paddingRight: sizes.size2,
    marginBottom: sizes.size1,
    ...txt.semiBold,
    ...stylePresets.roundedMd,
    color: theme.text1,
    textDecoration: "none",
  };

  const Content = () => {
    if (!icon && !label) {
      return null;
    }

    if (icon && !label) {
      return (
        <span style={{ ...layout.flex, ...stylePresets.justifyCenter }}>
          {icon}
        </span>
      );
    }

    return (
      <>
        {icon && <span style={{ marginRight: sizes.size2 }}>{icon}</span>}
        {label && <span>{label}</span>}
      </>
    );
  };

  return (
    <>
      <style>
        {`
          .nav-item:hover {
            background-color: ${theme.brand} !important;
            color: ${theme.surface1} !important;
          }
          .nav-item.active {
            background-color: ${theme.brand} !important;
            color: ${theme.surface1} !important;
          }
        `}
      </style>

      {onClick ? (
        <div onClick={onClick} className="nav-item" style={defaultStyle}>
          <Content />
        </div>
      ) : path ? (
        <NavLink
          to={path}
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          style={({ isActive }) => ({
            ...defaultStyle,
            color: isActive ? theme.surface1 : theme.text1,
            backgroundColor: isActive ? theme.brand : "transparent",
          })}
        >
          <Content />
        </NavLink>
      ) : (
        <div>没有路径</div>
      )}
    </>
  );
};

export default NavListItem;
