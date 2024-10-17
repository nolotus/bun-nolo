// MenuButton.tsx
import React from "react";
import { SidebarExpandIcon, SidebarCollapseIcon } from "@primer/octicons-react";
import { styles, themeStyles } from "render/ui/styles";
import Button from "render/ui/Button";

interface MenuButtonProps {
  onClick: () => void;
  theme: any;
  isExpanded: boolean;
}

const MenuButton: React.FC<MenuButtonProps> = ({
  onClick,
  theme,
  isExpanded,
}) => {
  const buttonStyle = {
    ...styles.buttonBase,
    ...themeStyles.surface1(theme),
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
      icon={
        isExpanded ? (
          <SidebarExpandIcon size={16} />
        ) : (
          <SidebarCollapseIcon size={16} />
        )
      }
      style={buttonStyle}
      hoverStyle={hoverStyle}
      activeStyle={activeStyle}
      aria-label="Menu"
    />
  );
};

export default MenuButton;
