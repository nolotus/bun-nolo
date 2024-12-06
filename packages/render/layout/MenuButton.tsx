// MenuButton.tsx
import React from "react";
import { MoveToEndIcon, MoveToStartIcon } from "@primer/octicons-react";
import { themeStyles } from "render/ui/styles";
import { stylePresets } from "render/ui/stylePresets";

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
    ...stylePresets.buttonBase,
    ...themeStyles.surface1(theme),
  };

  const hoverStyle = {
    backgroundColor: theme.surface2,
  };

  return (
    <Button
      onClick={onClick}
      icon={
        isExpanded ? <MoveToStartIcon size={16} /> : <MoveToEndIcon size={16} />
      }
      style={buttonStyle}
      hoverStyle={hoverStyle}
      aria-label="Menu"
    />
  );
};

export default MenuButton;
