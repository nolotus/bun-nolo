// ContentContextMenu.tsx
import React from "react";
import * as Ariakit from "@ariakit/react";
import { TrashIcon } from "@primer/octicons-react";
import { useTranslation } from "react-i18next";
import { ContextMenu, MenuItem } from "render/components/ContextMenu";

import { useAppDispatch, useAppSelector } from "app/hooks";
import {
  deleteContentFromSpace,
  selectCurrentSpaceId,
} from "create/space/spaceSlice";
import { remove } from "database/dbSlice";

interface ContentContextMenuProps {
  menu: Ariakit.MenuStore;
  anchorRect: { x: number; y: number };
  contentKey: string;
}

export const ContentContextMenu: React.FC<ContentContextMenuProps> = ({
  menu,
  anchorRect,
  contentKey,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const currentSpaceId = useAppSelector(selectCurrentSpaceId);

  const handleDelete = () => {
    if (!currentSpaceId) {
      console.error("No current space selected");
      return;
    }
    console.log("delete content", contentKey);
    dispatch(remove(contentKey)).unwrap();

    dispatch(
      deleteContentFromSpace({
        contentKey,
        spaceId: currentSpaceId,
      })
    );
    menu.hide();
  };

  const menuItems: MenuItem[] = [
    {
      id: "delete",
      label: t("deleteContent"),
      icon: <TrashIcon size={16} />,
      onClick: handleDelete,
    },
  ];

  return <ContextMenu menu={menu} anchorRect={anchorRect} items={menuItems} />;
};

export default ContentContextMenu;
