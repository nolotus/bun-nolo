import React from "react";
import { NavLink, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import * as Ariakit from "@ariakit/react";
import { selectTheme } from "app/theme/themeSlice";
import { useFetchData } from "app/hooks";
import { DialogContextMenu } from "chat/dialog/DialogContextMenu";
import { CommentIcon } from "@primer/octicons-react";
import { COLORS } from "render/styles/colors";

export const SIZES = {
  small: 16,
  medium: 20,
  large: 24,
};

export const DialogItem = ({ id, isCreator, categoryId, size = "medium" }) => {
  const { data: dialog } = useFetchData(id);
  const { pageId } = useParams();
  const theme = useSelector(selectTheme);

  const menu = Ariakit.useMenuStore();
  const [anchorRect, setAnchorRect] = React.useState({ x: 0, y: 0 });

  if (!dialog) return null;

  const iconSize = SIZES[size];
  const title = dialog.title || dialog.id;
  const isSelected = dialog.id === pageId;

  const handleContextMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorRect({ x: event.clientX, y: event.clientY });
    menu.show();
  };

  return (
    <>
      <style>
        {`
          .dialog-item {
            margin-bottom: 1px;
            padding: ${iconSize / 5}px ${iconSize * 0.8}px;
            transition: all 0.15s ease;
            display: flex;
            align-items: center;
            cursor: pointer;
            height: ${iconSize * 1.4}px;
            background-color: transparent;
          }

          .dialog-item:hover {
            background-color: ${COLORS.backgroundGhost};
          }

          .dialog-item.selected {
            background-color: ${COLORS.primaryGhost};
          }

          .dialog-link {
            font-size: ${iconSize / 1.7}px;
            line-height: 1.4;
            color: ${COLORS.textTertiary};
            flex-grow: 1;
            font-weight: 400;
            text-decoration: none;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding-left: ${iconSize / 1.7}px;
          }

          .dialog-item:hover .dialog-link {
            color: ${COLORS.textSecondary};
          }

          .dialog-item.selected .dialog-link {
            color: ${COLORS.primary};
            font-weight: 500;
          }

          .dialog-icon {
            color: ${COLORS.icon};
            opacity: 0.7;
          }

          .dialog-item.selected .dialog-icon {
            color: ${COLORS.primary};
            opacity: 1;
          }
        `}
      </style>

      <div
        className={`dialog-item ${isSelected ? "selected" : ""}`}
        onContextMenu={handleContextMenu}
      >
        <CommentIcon size={iconSize} className="dialog-icon" />
        <NavLink to={`/${dialog.id}`} className="dialog-link">
          {title}
        </NavLink>

        <DialogContextMenu
          menu={menu}
          anchorRect={anchorRect}
          dialogId={dialog.id}
        />
      </div>
    </>
  );
};
