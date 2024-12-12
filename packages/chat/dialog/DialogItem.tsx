import React, { useState } from "react";
import { NavLink, useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import * as Ariakit from "@ariakit/react";
import { selectTheme } from "app/theme/themeSlice";
import { useFetchData } from "app/hooks";
import { DialogContextMenu } from "chat/dialog/DialogContextMenu";
import { CommentIcon } from "@primer/octicons-react";

import { txt } from "render/styles/txt";
import { sizes } from "render/styles/sizes";

export const DialogItem = ({ id, isCreator, categoryId }) => {
  const { data: dialog } = useFetchData(id);
  const { pageId } = useParams();

  if (!dialog) {
    return null;
  }
  const theme = useSelector(selectTheme);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0 });
  const menu = Ariakit.useMenuStore();

  const title = dialog.title || dialog.id;
  const isSelected = dialog.id === pageId;

  // 注释大小：小中大
  const commentSize = sizes.size3; // 默认中等大小

  const itemContainerStyle = {
    marginBottom: sizes.size1,
    padding: `${sizes.size1} ${sizes.size2}`,
    borderRadius: sizes.size1,
    transition: "background 0.2s",
    backgroundColor: isSelected
      ? theme.surface3
      : isHovered
        ? theme.surface2
        : "transparent",
    display: "flex",
    alignItems: "center",
  };

  const linkStyle = {
    padding: sizes.size1,
    fontSize: "12px",
    color: isHovered ? theme.brand : theme.text1,
    flexGrow: 1,
    ...txt.decorationNone,
    ...txt.ellipsis,
  };

  const iconStyle = {
    width: sizes.size2,
    height: sizes.size2,
    marginRight: sizes.size1,
    color: theme.text2,
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorRect({ x: event.clientX, y: event.clientY });
    menu.show();
  };

  return (
    <div
      style={itemContainerStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onContextMenu={handleContextMenu}
    >
      <CommentIcon size={commentSize} style={iconStyle} />
      <NavLink to={`/${dialog.id}`} style={linkStyle}>
        {title}
      </NavLink>

      <DialogContextMenu
        menu={menu}
        anchorRect={anchorRect}
        dialogId={dialog.id}
      />
    </div>
  );
};
