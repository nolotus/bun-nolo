import React from "react";
import * as Ariakit from "@ariakit/react";
import { ArrowSwitchIcon, TrashIcon } from "@primer/octicons-react";
import { useTranslation } from "react-i18next";
import { ContextMenu, MenuItem } from "render/components/ContextMenu";

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

  const handleMoveToWorkspace = (workspaceId: string) => {
    onMoveToWorkspace(workspaceId);
    menu.hide();
  };

  const handleDeleteDialog = () => {
    onDeleteDialog();
    menu.hide();
  };

  const menuItems: MenuItem[] = [
    ...workspaces.map((workspace) => ({
      id: `move-${workspace.id}`,
      label: workspace.name,
      icon: <ArrowSwitchIcon size={16} />,
      onClick: () => handleMoveToWorkspace(workspace.id),
      disabled: workspace.id === currentWorkspaceId,
    })),
    {
      id: "delete",
      label: t("deleteDialog"),
      icon: <TrashIcon size={16} />,
      onClick: handleDeleteDialog,
    },
  ];

  return <ContextMenu menu={menu} anchorRect={anchorRect} items={menuItems} />;
};

export default DialogContextMenu;
