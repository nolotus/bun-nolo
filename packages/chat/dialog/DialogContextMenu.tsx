// DialogContextMenu.tsx
import React from "react";
import * as Ariakit from "@ariakit/react";
import { TrashIcon } from "@primer/octicons-react";
import { useTranslation } from "react-i18next";
import { ContextMenu, MenuItem } from "render/components/ContextMenu";

import { useAppDispatch, useAppSelector } from "app/hooks";
import { deleteDialog } from "./dialogSlice";
import {
  addToWorkspace,
  selectAllWorkspaces,
} from "create/workspace/workspaceSlice";

interface DialogContextMenuProps {
  menu: Ariakit.MenuStore;
  anchorRect: { x: number; y: number };
  dialogId: string;
}

export const DialogContextMenu: React.FC<DialogContextMenuProps> = ({
  menu,
  anchorRect,
  dialogId,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const workspaces = useAppSelector(selectAllWorkspaces);
  const handleDeleteDialog = () => {
    dispatch(deleteDialog(dialogId));
    menu.hide();
  };

  const handleAddToWorkspace = (workspaceId: string) => {
    dispatch(addToWorkspace({ entityId: dialogId, workspaceId }));
    menu.hide();
  };

  const menuItems: MenuItem[] = [
    {
      id: "delete",
      label: t("deleteDialog"),
      icon: <TrashIcon size={16} />,
      onClick: handleDeleteDialog,
    },
    {
      id: "addToWorkspace",
      label: t("addToWorkspace"),
      submenu: workspaces.map((ws) => ({
        id: ws.id,
        label: ws.name,
        onClick: () => handleAddToWorkspace(ws.id),
      })),
    },
  ];

  return <ContextMenu menu={menu} anchorRect={anchorRect} items={menuItems} />;
};

export default DialogContextMenu;
