import * as Ariakit from "@ariakit/react";
import { CommentIcon } from "@primer/octicons-react";
import { useFetchData } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import { DialogContextMenu } from "chat/dialog/DialogContextMenu";
import React from "react";
import { useSelector } from "react-redux";
import { NavLink, useParams } from "react-router-dom";

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
            margin: 2px 8px;
            padding: 8px 12px;
            transition: all 0.2s ease-out;
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            border-radius: 6px;
            background-color: transparent;
            border: 1px solid transparent;
          }


          .dialog-item:hover {
            background-color: ${theme.backgroundGhost};
            transform: translateX(2px);
            border-color: ${theme.borderLight};
          }


          .dialog-item.selected {
            background-color: ${theme.primaryGhost};
            border-color: ${theme.primaryLight}30;
          }


          .dialog-link {
            font-size: ${iconSize / 1.6}px;
            line-height: 1.4;
            color: ${theme.textSecondary};
            flex-grow: 1;
            font-weight: 400;
            text-decoration: none;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            transition: color 0.2s ease-out;
          }


          .dialog-item:hover .dialog-link {
            color: ${theme.text};
          }


          .dialog-item.selected .dialog-link {
            color: ${theme.primary};
            font-weight: 500;
          }


          .dialog-icon {
            color: ${theme.textTertiary};
            transition: all 0.2s ease-out;
          }


          .dialog-item:hover .dialog-icon {
            color: ${theme.textSecondary};
          }


          .dialog-item.selected .dialog-icon {
            color: ${theme.primary};
          }


          @keyframes smoothFadeIn {
            from {
              opacity: 0;
              transform: translateY(2px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }


          .dialog-item {
            animation: smoothFadeIn 0.2s ease-out;
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
