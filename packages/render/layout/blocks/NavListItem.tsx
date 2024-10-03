// render/layout/blocks/NavListItem.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";
import { styles } from "render/ui/styles";

interface NavListItemProps {
  path?: string;
  label: string;
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

  const defaultStyle: React.CSSProperties = {
    ...styles.flex,
    ...styles.flexStart,
    ...styles.transition,
    ...styles.clickable,
    ...styles.py1,
    ...styles.px2,
    ...styles.mb1,
    ...styles.fontSemiBold,
    ...styles.roundedMd,
    color: theme.text1,
    textDecoration: "none",
  };

  const Content = () => (
    <>
      {icon && <span style={{ ...styles.mr2 }}>{icon}</span>}
      <span>{label}</span>
    </>
  );

  if (onClick) {
    return (
      <div
        onClick={onClick}
        style={defaultStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.accentColor;
          e.currentTarget.style.color = theme.surface1;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = theme.text1;
        }}
      >
        <Content />
      </div>
    );
  }

  if (!path) {
    return null;
  }

  return (
    <NavLink
      to={path}
      className={({ isActive }) => (isActive ? "active" : "")}
      style={({ isActive }) => ({
        ...defaultStyle,
        color: isActive ? theme.surface1 : theme.text1,
        backgroundColor: isActive ? theme.accentColor : "transparent",
      })}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = theme.accentColor;
        e.currentTarget.style.color = theme.surface1;
      }}
      onMouseLeave={(e) => {
        if (!e.currentTarget.classList.contains("active")) {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = theme.text1;
        }
      }}
    >
      <Content />
    </NavLink>
  );
};

export default NavListItem;
