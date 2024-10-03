// render/layout/SidebarToggleButton.tsx
import React from "react";
import { ThreeBarsIcon } from "@primer/octicons-react";
import { useSelector } from "react-redux";
import { selectTheme } from "../../app/theme/themeSlice";

interface SidebarToggleButtonProps {
  onClick: () => void;
  isSidebarOpen: boolean;
}

const SidebarToggleButton: React.FC<SidebarToggleButtonProps> = ({
  onClick,
  isSidebarOpen,
}) => {
  const theme = useSelector(selectTheme);

  const buttonStyle: React.CSSProperties = {
    position: "fixed",
    left: isSidebarOpen ? "266px" : "10px",
    top: "10px",
    zIndex: theme.zIndex.layer3,
    background: theme.themeName === "dark" ? theme.surface3 : "white",
    border: "none",
    cursor: "pointer",
    transition: "left 0.3s, background-color 0.2s",
    padding: theme.spacing.small,
    borderRadius: theme.borderRadius,
    color: theme.text1,
    boxShadow:
      theme.themeName === "light"
        ? "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)"
        : "none",
  };

  return (
    <button
      onClick={onClick}
      style={buttonStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor =
          theme.themeName === "dark" ? theme.surface4 : theme.surface2;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor =
          theme.themeName === "dark" ? theme.surface3 : "white";
      }}
    >
      <ThreeBarsIcon size={theme.iconSize.medium} />
    </button>
  );
};

export default SidebarToggleButton;
