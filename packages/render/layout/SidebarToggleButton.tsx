// render/layout/SidebarToggleButton.tsx
import React from "react";
import { ThreeBarsIcon } from "@primer/octicons-react";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";
import { styles, themeStyles, Theme } from "../ui/styles";

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
    ...styles.positionFixed,
    left: isSidebarOpen ? `${theme.sidebarWidth + 10}px` : "10px", // 调整按钮位置
    top: "10px",
    ...styles.zIndex3, // 使用 styles.zIndex3
    ...themeStyles.bgColor1(theme),
    border: "none",
    cursor: "pointer",
    transition: "left 0.3s, background-color 0.2s",
    padding: theme.spacing.small,
    borderRadius: theme.borderRadius,
    ...themeStyles.textColor1(theme),
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
