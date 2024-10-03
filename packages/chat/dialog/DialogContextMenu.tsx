import React from "react";
import * as Ariakit from "@ariakit/react";
import { TrashIcon } from "@primer/octicons-react";
import { useTranslation } from "react-i18next";
import { ContextMenu, MenuItem } from "render/components/ContextMenu";
import { useAppDispatch } from "app/hooks";

import { deleteDialog } from "./dialogSlice";

interface DialogContextMenuProps {
  menu: Ariakit.MenuStore;
  anchorRect: { x: number; y: number };
  dialogId: string;
  onDeleteDialog: () => void;
}

export const DialogContextMenu: React.FC<DialogContextMenuProps> = ({
  menu,
  anchorRect,
  dialogId,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const handleDeleteDialog = () => {
    dispatch(deleteDialog(dialogId));
    menu.hide();
  };

  const menuItems: MenuItem[] = [
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
