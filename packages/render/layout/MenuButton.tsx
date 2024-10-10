// render/layout/MenuButton.tsx
import React from "react";
import { ThreeBarsIcon } from "@primer/octicons-react";
import { themeStyles } from "render/ui/styles";

interface MenuButtonProps {
  onClick: () => void;
  theme: any;
}

const buttonStyle = (theme: any): React.CSSProperties => ({
  ...themeStyles.bgColor1(theme),
  border: "none",
  cursor: "pointer",
  transition: "background-color 0.2s",
  padding: theme.spacing.small,
  borderRadius: theme.borderRadius,
  ...themeStyles.textColor1(theme),
});

const handleMouseEnter = (
  e: React.MouseEvent<HTMLButtonElement>,
  theme: any,
) => {
  e.currentTarget.style.backgroundColor =
    theme.themeName === "dark" ? theme.surface4 : theme.surface2;
};

const handleMouseLeave = (
  e: React.MouseEvent<HTMLButtonElement>,
  theme: any,
) => {
  e.currentTarget.style.backgroundColor =
    theme.themeName === "dark" ? theme.surface3 : "white";
};

const MenuButton: React.FC<MenuButtonProps> = ({ onClick, theme }) => (
  <button
    onClick={onClick}
    style={buttonStyle(theme)}
    onMouseEnter={(e) => handleMouseEnter(e, theme)}
    onMouseLeave={(e) => handleMouseLeave(e, theme)}
  >
    <ThreeBarsIcon size={theme.iconSize.medium} />
  </button>
);

export default MenuButton;
