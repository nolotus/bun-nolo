import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import * as Ariakit from "@ariakit/react";
import { selectTheme } from "app/theme/themeSlice";
import { useAppDispatch, useFetchData } from "app/hooks";
import { initDialog } from "./dialogSlice";
import { DialogContextMenu } from "./DialogContextMenu";

// TasklistIcon
//FileIcon
//ArchiveIcon
//FileMediaIcon
export const DialogItem = ({ id, isCreator, source, categoryId }) => {
  const dispatch = useAppDispatch();
  const { data: dialog } = useFetchData(id, { source });
  const theme = useSelector(selectTheme);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0 });
  const menu = Ariakit.useMenuStore();

  const title = dialog?.title || dialog.id;
  const isSelected = location.search === `?dialogId=${dialog.id}`;

  const styles = {
    itemContainer: {
      marginBottom: "2px",
      borderRadius: "4px",
      transition: "all 0.2s ease",
      backgroundColor: isSelected
        ? theme.surface3
        : isHovered
          ? theme.surface2
          : "transparent",
      cursor: "pointer",
    },
    link: {
      display: "block",
      color: isHovered ? theme.accentColor : theme.text1,
      textDecoration: "none",
      padding: "6px 12px",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      fontSize: "13px",
      transition: "color 0.2s ease",
    },
  };

  const handleClick = (e) => {
    dispatch(initDialog({ dialogId: dialog.id, source: dialog.source }));
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorRect({ x: event.clientX, y: event.clientY });
    menu.show();
  };

  return (
    <div
      style={styles.itemContainer}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onContextMenu={handleContextMenu}
    >
      <NavLink
        to={`/chat/${dialog.id}`}
        style={styles.link}
        onClick={handleClick}
      >
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
