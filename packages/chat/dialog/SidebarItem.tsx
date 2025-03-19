import * as Ariakit from "@ariakit/react";
import {
  CommentIcon,
  FileIcon,
  ImageIcon,
  BookIcon,
  FileCodeIcon,
  GrabberIcon,
} from "@primer/octicons-react";
import { FaFileLines } from "react-icons/fa6";
import { selectTheme } from "app/theme/themeSlice";
import { ContentContextMenu } from "./ContentContextMenu";
import React from "react";
import { useSelector } from "react-redux";
import { NavLink, useParams } from "react-router-dom";

interface SidebarItemProps {
  contentKey: string;
  type: "dialog" | "page" | "image" | "doc" | "code" | "file";
  title: string;
  categoryId?: string;
  handleProps?: any;
}

const ITEM_ICONS = {
  dialog: CommentIcon,
  page: FaFileLines,
  image: ImageIcon,
  doc: BookIcon,
  code: FileCodeIcon,
  file: FileIcon,
} as const;

const ICON_SIZE = 18;

export const SidebarItem: React.FC<SidebarItemProps> = React.memo(
  ({ contentKey, type, title, handleProps }) => {
    const { pageId } = useParams();
    const theme = useSelector(selectTheme);
    const menu = Ariakit.useMenuStore();
    const [anchorRect, setAnchorRect] = React.useState({ x: 0, y: 0 });
    const [isIconHover, setIsIconHover] = React.useState(false);
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
          <span
            className={`item-icon ${isIconHover ? "is-draggable" : ""}`}
            {...handleProps}
            onMouseEnter={() => setIsIconHover(true)}
            onMouseLeave={() => setIsIconHover(false)}
          >
            {isIconHover ? (
              <GrabberIcon size={ICON_SIZE} />
            ) : (
              <IconComponent size={ICON_SIZE} />
            )}
          </span>
          <NavLink to={`/${contentKey}`} className="sidebar-link">
            {displayTitle}
          </NavLink>

          <ContentContextMenu
            menu={menu}
            anchorRect={anchorRect}
            contentKey={contentKey}
          />
        </div>
        <style jsx>{`
          .sidebar-item {
            margin: 2px 0;
            padding: 7px 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            border-radius: 8px;
            position: relative;
            transition: all 0.15s ease;
            color: ${theme.textSecondary};
            user-select: none;
          }

          .sidebar-item:hover {
            background-color: ${theme.backgroundHover};
            color: ${theme.text};
          }

          .sidebar-item.selected {
            background-color: ${theme.primaryGhost ||
            "rgba(22, 119, 255, 0.08)"};
            color: ${theme.primary};
          }

          .sidebar-item.selected::before {
            content: "";
            position: absolute;
            left: -6px;
            top: 50%;
            transform: translateY(-50%);
            width: 3px;
            height: 16px;
            background: ${theme.primary};
            border-radius: 0 2px 2px 0;
            opacity: ${isSelected ? 1 : 0};
            transition: opacity 0.2s ease;
          }

          .item-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${ICON_SIZE + 6}px;
            height: ${ICON_SIZE + 6}px;
            border-radius: 6px;
            color: ${theme.textTertiary};
            transition:
              color 0.2s ease,
              background-color 0.2s ease;
            flex-shrink: 0;
          }

          .item-icon.is-draggable {
            color: ${theme.textSecondary};
            background-color: ${theme.backgroundTertiary};
            cursor: grab;
          }

          .sidebar-item:hover .item-icon {
            color: ${theme.textSecondary};
          }

          .sidebar-item.selected .item-icon {
            color: ${theme.primary};
          }

          .sidebar-link {
            font-size: 14px;
            line-height: 1.4;
            flex-grow: 1;
            font-weight: 400;
            text-decoration: none;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: inherit;
            transition: color 0.15s ease;
            letter-spacing: -0.01em;
          }

          .sidebar-item.selected .sidebar-link {
            font-weight: 500;
          }
        `}</style>
      </>
    );
  }
);

SidebarItem.displayName = "SidebarItem";

export default SidebarItem;
