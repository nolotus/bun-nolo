// src/chat/dialog/DialogContextMenu.tsx

import React from "react";
import * as Ariakit from "@ariakit/react";
import { ArrowSwitchIcon, TrashIcon } from "@primer/octicons-react";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";
import { useTranslation } from "react-i18next";

interface DialogContextMenuProps {
  menu: Ariakit.MenuStore;
  anchorRect: { x: number; y: number };
  dialogId: string;
  onMoveToWorkspace: (workspaceId: string) => void;
  onDeleteDialog: () => void;
  workspaces: { id: string; name: string }[];
  currentWorkspaceId: string | null;
}

export const DialogContextMenu: React.FC<DialogContextMenuProps> = ({
  menu,
  anchorRect,
  dialogId,
  onMoveToWorkspace,
  onDeleteDialog,
  workspaces,
  currentWorkspaceId,
}) => {
  const { t } = useTranslation();
  const theme = useSelector(selectTheme);

  const menuStyle = {
    backgroundColor: theme.surface1,
    color: theme.text1,
    border: `1px solid ${theme.surface3}`,
    borderRadius: "8px",
    padding: "0.5rem 0",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  };

  const menuItemStyle = {
    display: "flex",
    alignItems: "center",
    padding: "0.5rem 1rem",
    cursor: "pointer",
    color: theme.text1,
    transition: "background-color 0.2s ease",
  };

  const iconStyle = {
    marginRight: "0.5rem",
    color: theme.text2,
  };

  const separatorStyle = {
    height: "1px",
    backgroundColor: theme.surface3,
    margin: "0.25rem 0",
  };

  return (
    <Ariakit.Menu
      store={menu}
      modal
      getAnchorRect={() => anchorRect}
      style={menuStyle}
    >
      <Ariakit.MenuHeading style={menuItemStyle}>
        {t("moveToWorkspace")}
      </Ariakit.MenuHeading>
      {workspaces.map((workspace) => (
        <Ariakit.MenuItem
          key={workspace.id}
          onClick={() => onMoveToWorkspace(workspace.id)}
          style={menuItemStyle}
          disabled={workspace.id === currentWorkspaceId}
        >
          <ArrowSwitchIcon size={16} style={iconStyle} /> {workspace.name}
        </Ariakit.MenuItem>
      ))}
      <Ariakit.MenuSeparator style={separatorStyle} />
      <Ariakit.MenuItem onClick={onDeleteDialog} style={menuItemStyle}>
        <TrashIcon size={16} style={iconStyle} /> {t("deleteDialog")}
      </Ariakit.MenuItem>
    </Ariakit.Menu>
  );
};

export default DialogContextMenu;
