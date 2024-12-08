import React, { useState } from "react";
import { NavLink, useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import * as Ariakit from "@ariakit/react";
import { selectTheme } from "app/theme/themeSlice";
import { useAppDispatch, useFetchData } from "app/hooks";
import { themeStyles } from "render/ui/styles";
import { stylePresets } from "render/styles/stylePresets";
import { DialogContextMenu } from "chat/dialog/DialogContextMenu";

import { txt } from "render/styles/txt";
import { sizes } from "render/styles/sizes";

export const DialogItem = ({ id, isCreator, categoryId }) => {
  const { data: dialog } = useFetchData(id);

  if (!dialog) {
    return null;
  }
  const dispatch = useAppDispatch();
  const { dialogId } = useParams();
  const theme = useSelector(selectTheme);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0 });
  const menu = Ariakit.useMenuStore();

  const title = dialog.title || dialog.id;
  const isSelected = dialog.id === dialogId;

  const itemContainerStyle = {
    marginBottom: sizes.size1,
    ...stylePresets.rounded,
    ...stylePresets.transition,
    ...themeStyles.surface1(theme),
    backgroundColor: isSelected
      ? theme.surface3
      : isHovered
        ? theme.surface2
        : "transparent",
    ...stylePresets.clickable,
  };

  const linkStyle = {
    padding: sizes.size2,
    ...txt.ellipsis,
    ...txt.size14,
    ...txt.decorationNone,
    ...txt.colorInherit,
    ...stylePresets.transition,
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
