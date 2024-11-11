import React, { useState } from "react";
import { NavLink, useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import * as Ariakit from "@ariakit/react";
import { selectTheme } from "app/theme/themeSlice";
import { useAppDispatch, useFetchData } from "app/hooks";
import { styles, themeStyles } from "render/ui/styles";

import { DialogContextMenu } from "chat/dialog/DialogContextMenu";

export const DialogItem = ({ id, isCreator, categoryId }) => {
  const dispatch = useAppDispatch();
  const { data: dialog } = useFetchData(id);
  const { dialogId } = useParams();
  const theme = useSelector(selectTheme);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0 });
  const menu = Ariakit.useMenuStore();

  const title = dialog?.title || dialog.id;
  const isSelected = dialog.id === dialogId;

  const itemContainerStyle = {
    ...styles.mb1,
    ...styles.rounded,
    ...styles.transition,
    ...themeStyles.surface1(theme),
    backgroundColor: isSelected
      ? theme.surface3
      : isHovered
        ? theme.surface2
        : "transparent",
    ...styles.clickable,
  };

  const linkStyle = {
    ...styles.p2,
    ...styles.textEllipsis,
    ...styles.fontSize14,
    ...styles.textDecorationNone,
    ...styles.colorInherit,
    ...styles.transition,
    color: isHovered ? theme.brand : theme.text1,
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
      <NavLink to={`/chat/${dialog.id}`} style={linkStyle}>
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
