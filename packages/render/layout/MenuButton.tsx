// MenuButton.tsx
import React from "react";
import { ThreeBarsIcon } from "@primer/octicons-react";
import { styles, themeStyles } from "render/ui/styles";
import Button from "render/ui/Button";

interface MenuButtonProps {
  onClick: () => void;
  theme: any;
}

const MenuButton: React.FC<MenuButtonProps> = ({ onClick, theme }) => {
  const buttonStyle = {
    ...styles.buttonBase,
    ...themeStyles.textColor1(theme),
    backgroundColor: "transparent",
    border: "none",
    padding: theme.spacing.small,
  };

  const hoverStyle = {
    backgroundColor: theme.surface2,
  };

  const activeStyle = {
    backgroundColor: theme.surface3,
    transform: "scale(0.95)",
  };

  return (
    <Button
      onClick={onClick}
      icon={<ThreeBarsIcon size={theme.iconSize.medium} />}
      style={buttonStyle}
      hoverStyle={hoverStyle}
      activeStyle={activeStyle}
      aria-label="Menu"
    />
  );
};

export default MenuButton;
