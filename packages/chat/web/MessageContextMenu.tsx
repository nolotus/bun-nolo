import type * as Ariakit from "@ariakit/react";
import { TrashIcon } from "@primer/octicons-react";

import { useAppDispatch, useAppSelector } from "app/hooks";
import { useTranslation } from "react-i18next";
import { ContextMenu, type MenuItem } from "render/components/ContextMenu";

import { deleteDialogMsgs } from "../messages/messageSlice";
import { extractCustomId } from "core/prefix";
import { selectCurrentDialogConfig } from "../dialog/dialogSlice";

interface MessageContextMenuProps {
  menu: Ariakit.MenuStore;
  anchorRect: { x: number; y: number };
  content: any;
  id: string;
}

export const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
  menu,
  anchorRect,
  content,
  id,
}) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("chat");
  const dialog = useAppSelector(selectCurrentDialogConfig);
  const dialogKey = dialog.dbKey || dialog.id;
  const dialogId = extractCustomId(dialogKey);

  const handleClearConversation = () => {
    dispatch(deleteDialogMsgs(dialogId));
    menu.hide();
  };

  const menuItems: MenuItem[] = [
    {
      id: "clear",
      label: t("clearConversation"),
      icon: <TrashIcon size={16} />,
      onClick: handleClearConversation,
    },
  ];

  return <ContextMenu menu={menu} anchorRect={anchorRect} items={menuItems} />;
};
