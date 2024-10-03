import React, { useState } from "react";
import { useSelector } from "react-redux";
import * as Ariakit from "@ariakit/react";
import { selectTheme } from "app/theme/themeSlice";
import { FileIcon, FileDirectoryIcon } from "@primer/octicons-react";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "app/hooks";
import { selectFilteredDataByUserAndType } from "database/selectors";
import { selectCurrentUserId } from "auth/authSlice";
import { DataType } from "create/types";

import { DialogList } from "./DialogList";
import { ContextMenu, MenuItem } from "render/components/ContextMenu";

const DialogSideBar = ({}) => {
  const currentUserId = useAppSelector(selectCurrentUserId);
  const dialogList = useAppSelector(
    selectFilteredDataByUserAndType(currentUserId, DataType.Dialog),
  );

  const theme = useSelector(selectTheme);
  const { t } = useTranslation();
  const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0 });
  const menu = Ariakit.useMenuStore();

  const sidebarContainerStyle = {
    height: "100%",
    backgroundColor: theme.surface1,
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setAnchorRect({ x: event.clientX, y: event.clientY });
    menu.show();
  };

  const menuItems: MenuItem[] = [
    {
      id: "addFile",
      label: t("addFile"),
      icon: <FileIcon size={16} />,
      onClick: () => {
        console.log("Add file");
        menu.hide();
      },
    },
    {
      id: "addProject",
      label: t("addProject"),
      icon: <FileDirectoryIcon size={16} />,
      onClick: () => {
        console.log("Add project");
        menu.hide();
      },
    },
  ];

  return (
    <div style={sidebarContainerStyle} onContextMenu={handleContextMenu}>
      <DialogList dialogList={dialogList} />
      <ContextMenu menu={menu} anchorRect={anchorRect} items={menuItems} />
    </div>
  );
};

export default DialogSideBar;
