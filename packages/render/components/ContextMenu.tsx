import React, { useState } from "react";
import * as Ariakit from "@ariakit/react";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";

export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

interface ContextMenuProps {
  menu: Ariakit.MenuStore;
  anchorRect: { x: number; y: number };
  items: MenuItem[];
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  menu,
  anchorRect,
  items,
}) => {
  const theme = useSelector(selectTheme);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const menuStyle: React.CSSProperties = {
    backgroundColor: theme.surface1,
    color: theme.text1,
    border: `1px solid ${theme.surface3}`,
    borderRadius: "8px",
    padding: "4px 0",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    minWidth: "180px",
    fontSize: "14px",
    zIndex: 2,
  };

  const menuItemBaseStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    padding: "8px 12px",
    cursor: "pointer",
    color: theme.text1,
    transition: "background-color 0.2s ease",
    userSelect: "none",
  };

  const menuItemStyle = (
    id: string,
    disabled: boolean,
  ): React.CSSProperties => ({
    ...menuItemBaseStyle,
    backgroundColor:
      hoveredItem === id && !disabled ? theme.surface2 : "transparent",
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? "default" : "pointer",
  });

  const iconStyle: React.CSSProperties = {
    marginRight: "8px",
    color: theme.text2,
    flexShrink: 0,
  };

  return (
    <Ariakit.Menu
      store={menu}
      modal
      getAnchorRect={() => anchorRect}
      style={menuStyle}
    >
      {items.map((item) => (
        <Ariakit.MenuItem
          key={item.id}
          onClick={item.disabled ? undefined : item.onClick}
          style={menuItemStyle(item.id, !!item.disabled)}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          disabled={item.disabled}
        >
          {item.icon && <span style={iconStyle}>{item.icon}</span>}
          {item.label}
        </Ariakit.MenuItem>
      ))}
    </Ariakit.Menu>
  );
};
