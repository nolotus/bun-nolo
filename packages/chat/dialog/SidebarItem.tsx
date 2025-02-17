import * as Ariakit from "@ariakit/react";
import {
  CommentIcon,
  FileIcon,
  ImageIcon,
  BookIcon,
  FileCodeIcon,
} from "@primer/octicons-react";
import { selectTheme } from "app/theme/themeSlice";
import { ContentContextMenu } from "./ContentContextMenu";
import React from "react";
import { useSelector } from "react-redux";
import { NavLink, useParams } from "react-router-dom";

// 类型定义
interface SidebarItemProps {
  contentKey: string;
  type: "dialog" | "page" | "image" | "doc" | "code" | "file";
  title: string;
}

const ITEM_ICONS = {
  dialog: CommentIcon,
  page: FileIcon,
  image: ImageIcon,
  doc: FileIcon,
  code: FileCodeIcon,
  file: FileIcon,
} as const;

const ICON_SIZE = 20;

export const SidebarItem: React.FC<SidebarItemProps> = React.memo(
  ({ contentKey, type, title }) => {
    const { pageId } = useParams();
    const theme = useSelector(selectTheme);
    const menu = Ariakit.useMenuStore();
    const [anchorRect, setAnchorRect] = React.useState({ x: 0, y: 0 });

    const IconComponent = ITEM_ICONS[type] || FileIcon;
    const displayTitle = title || contentKey;
    const isSelected = contentKey === pageId;

    const handleContextMenu = React.useCallback(
      (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setAnchorRect({ x: event.clientX, y: event.clientY });
        menu.show();
      },
      [menu]
    );

    return (
      <>
        <div
          className={`sidebar-item ${isSelected ? "selected" : ""}`}
          onContextMenu={handleContextMenu}
        >
          <IconComponent size={ICON_SIZE} className="sidebar-icon" />
          <NavLink to={`/${contentKey}`} className="sidebar-link">
            {displayTitle}
          </NavLink>

          <ContentContextMenu
            menu={menu}
            anchorRect={anchorRect}
            contentKey={contentKey}
          />
        </div>
        <style>
          {`
          .sidebar-item {
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
            animation: smoothFadeIn 0.2s ease-out;
          }

          .sidebar-item:hover {
            background-color: ${theme.backgroundGhost};
            transform: translateX(2px);
            border-color: ${theme.borderLight};
          }

          .sidebar-item.selected {
            background-color: ${theme.primaryGhost};
            border-color: ${theme.primaryLight}30;
          }

          .sidebar-link {
            font-size: ${ICON_SIZE / 1.6}px;
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

          .sidebar-item:hover .sidebar-link {
            color: ${theme.text};
          }

          .sidebar-item.selected .sidebar-link {
            color: ${theme.primary};
            font-weight: 500;
          }

          .sidebar-icon {
            color: ${theme.textTertiary};
            transition: all 0.2s ease-out;
          }

          .sidebar-item:hover .sidebar-icon {
            color: ${theme.textSecondary};
          }

          .sidebar-item.selected .sidebar-icon {
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
        `}
        </style>
      </>
    );
  }
);

// 添加displayName以便调试
SidebarItem.displayName = "SidebarItem";

export default SidebarItem;
