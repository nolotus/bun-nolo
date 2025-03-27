import {
  DiscussionOutdatedIcon,
  FileIcon,
  ImageIcon,
  BookIcon,
  FileCodeIcon,
  GrabberIcon,
} from "@primer/octicons-react";
import { FaFileLines } from "react-icons/fa6";
import { selectTheme } from "app/theme/themeSlice";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { NavLink, useParams } from "react-router-dom";
import DeleteContentButton from "./DeleteContentButton";

interface SidebarItemProps {
  contentKey: string;
  type: "dialog" | "page" | "image" | "doc" | "code" | "file";
  title: string;
  // 保留 categoryId 如果其他地方需要
  categoryId?: string;
  // 保留 handleProps 用于拖放
  handleProps?: any;
}

const ITEM_ICONS = {
  dialog: DiscussionOutdatedIcon,
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
    const [isIconHover, setIsIconHover] = useState(false);

    const IconComponent = ITEM_ICONS[type] || FileIcon;
    const displayTitle = title || contentKey;
    const isSelected = contentKey === pageId;

    const rootClassName =
      `SidebarItem ${isSelected ? "SidebarItem--selected" : ""}`.trim();
    const iconClassName =
      `SidebarItem__icon ${isIconHover ? "SidebarItem__icon--draggable" : ""}`.trim();

    return (
      <>
        <div className={rootClassName}>
          <span
            className={iconClassName}
            {...handleProps}
            onMouseEnter={() => setIsIconHover(true)}
            onMouseLeave={() => setIsIconHover(false)}
            // 为抓取图标添加 title
            title={isIconHover ? "拖拽排序" : ""}
          >
            {isIconHover ? (
              <GrabberIcon size={ICON_SIZE} />
            ) : (
              <IconComponent size={ICON_SIZE} />
            )}
          </span>
          <NavLink to={`/${contentKey}`} className="SidebarItem__link">
            {displayTitle}
          </NavLink>

          {/*
             传递一个特定的类名给 DeleteContentButton，
             以便 SidebarItem 的 CSS 可以控制其可见性
          */}
          <DeleteContentButton
            contentKey={contentKey}
            title={displayTitle}
            theme={theme}
            className="SidebarItem__deleteButton"
          />
        </div>

        <style href="sidebar-item">{`
          .SidebarItem {
            margin: 2px 0;
            padding: 7px 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            border-radius: 8px;
            position: relative;
            transition: background-color 0.15s ease, color 0.15s ease;
            color: ${theme.textSecondary};
            user-select: none;
            /* 确保最小高度 */
            min-height: 36px;
          }

          .SidebarItem:hover {
            background-color: ${theme.backgroundHover};
            color: ${theme.text};
          }

          .SidebarItem--selected {
            background-color: ${theme.primaryGhost || "rgba(22, 119, 255, 0.08)"};
            color: ${theme.primary};
          }

          .SidebarItem--selected::before {
            content: "";
            position: absolute;
            /* 相对于 padding 定位 */
            left: -6px;
            top: 50%;
            transform: translateY(-50%);
            width: 3px;
            height: 16px;
            background: ${theme.primary};
            border-radius: 0 2px 2px 0;
            /* 过渡已移除 - 随选中状态出现/消失 */
          }

          .SidebarItem__icon {
            display: flex;
            align-items: center;
            justify-content: center;
            /* width/height 可能由图标大小 + padding 控制 */
            /* 添加内边距 */
            padding: 3px;
            border-radius: 6px;
            color: ${theme.textTertiary};
            transition:
              color 0.2s ease,
              background-color 0.2s ease;
            flex-shrink: 0;
          }

          .SidebarItem__icon--draggable {
            color: ${theme.textSecondary};
            background-color: ${theme.backgroundTertiary};
            cursor: grab;
          }
           .SidebarItem__icon--draggable:active {
             cursor: grabbing;
           }

          .SidebarItem:hover .SidebarItem__icon {
            color: ${theme.textSecondary};
          }

          .SidebarItem--selected .SidebarItem__icon {
            color: ${theme.primary};
          }

          .SidebarItem__link {
            font-size: 14px;
            line-height: 1.4;
            flex-grow: 1;
            font-weight: 400;
            text-decoration: none;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            /* 继承 .SidebarItem 的颜色 */
            color: inherit;
            transition: color 0.15s ease, font-weight 0.15s ease;
            letter-spacing: -0.01em;
            /* 允许 flex item 收缩 */
            min-width: 0;
          }

          .SidebarItem--selected .SidebarItem__link {
            font-weight: 500;
          }

          /* --- 控制删除按钮可见性 --- */
          /* 选择传递给 DeleteContentButton 的特定类名 */
          .SidebarItem__deleteButton {
             opacity: 0;
             transition: opacity 0.2s ease;
             /* 将按钮推到最右侧 */
             margin-left: auto;
             /* 确保内边距一致 */
             padding: 4px;
          }

          .SidebarItem:hover .SidebarItem__deleteButton {
             opacity: 0.7;
          }

          /* 当直接悬停在删除按钮上时，使其完全不透明 */
          /* 此规则应封装在 DeleteContentButton 的样式中 */
          /* 但如果这里需要更高优先级: */
           .SidebarItem .SidebarItem__deleteButton:hover {
             /* 确保覆盖 0.7 */
             opacity: 1 !important;
           }

        `}</style>
      </>
    );
  }
);

SidebarItem.displayName = "SidebarItem";

export default SidebarItem;
