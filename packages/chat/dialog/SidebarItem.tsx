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
// 1. 导入 useSearchParams 来读取当前 URL 的查询参数
import { NavLink, useParams, useSearchParams } from "react-router-dom";
import DeleteContentButton from "./DeleteContentButton";
import { selectCurrentSpaceId } from "create/space/spaceSlice"; // 确认路径正确

interface SidebarItemProps {
  contentKey: string;
  type: "dialog" | "page" | "image" | "doc" | "code" | "file";
  title: string;
  categoryId?: string;
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
    // 2. 获取路径参数 pageId
    const { pageId: pageIdFromPath } = useParams<{ pageId?: string }>();
    // 3. 获取当前 URL 的查询参数
    const [searchParams] = useSearchParams();
    const theme = useSelector(selectTheme);
    // 4. 从 Redux store 获取当前的 spaceId (这是目标链接要用的)
    const currentSpaceId = useSelector(selectCurrentSpaceId);
    const [isIconHover, setIsIconHover] = useState(false);

    const IconComponent = ITEM_ICONS[type] || FileIcon;
    const displayTitle = title || contentKey;

    // 5. 更新选中状态的判断逻辑
    //    - 路径中的 pageId 必须等于当前项的 contentKey
    //    - URL 查询参数中的 spaceId 必须等于 Redux 中的 currentSpaceId
    const spaceIdFromQuery = searchParams.get("spaceId"); // 从当前 URL 读取 spaceId
    const isSelected =
      pageIdFromPath === contentKey && spaceIdFromQuery === currentSpaceId;

    const rootClassName =
      `SidebarItem ${isSelected ? "SidebarItem--selected" : ""}`.trim();
    const iconClassName =
      `SidebarItem__icon ${isIconHover ? "SidebarItem__icon--draggable" : ""}`.trim();

    // 6. 构建目标 URL，将 spaceId 作为查询参数
    //    格式: /{contentKey}?spaceId={currentSpaceId}
    const targetUrlObject = {
      pathname: `/${contentKey}`,
      search: currentSpaceId ? `?spaceId=${currentSpaceId}` : "", // 只有当 spaceId 存在时才添加
    };

    return (
      <>
        <div className={rootClassName}>
          <span
            className={iconClassName}
            {...handleProps}
            onMouseEnter={() => setIsIconHover(true)}
            onMouseLeave={() => setIsIconHover(false)}
            title={isIconHover ? "拖拽排序" : ""}
          >
            {isIconHover ? (
              <GrabberIcon size={ICON_SIZE} />
            ) : (
              <IconComponent size={ICON_SIZE} />
            )}
          </span>
          {/* 7. 更新 NavLink 的 `to` 属性，可以传递对象 */}
          <NavLink
            to={targetUrlObject} // 传递路径和查询参数对象
            className="SidebarItem__link"
            // 阻止无效点击 (如果需要，虽然这里 spaceId 不决定路径本身)
            // onClick={(e) => { if (!currentSpaceId) e.preventDefault(); }}
          >
            {displayTitle}
          </NavLink>

          <DeleteContentButton
            contentKey={contentKey}
            title={displayTitle}
            theme={theme}
            className="SidebarItem__deleteButton"
          />
        </div>

        {/* --- CSS 部分保持不变 --- */}
        <style href="sidebar-item">{`
          /* ... CSS 样式保持不变 ... */
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
            left: -6px;
            top: 50%;
            transform: translateY(-50%);
            width: 3px;
            height: 16px;
            background: ${theme.primary};
            border-radius: 0 2px 2px 0;
          }

          .SidebarItem__icon {
            display: flex;
            align-items: center;
            justify-content: center;
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
            color: inherit;
            transition: color 0.15s ease, font-weight 0.15s ease;
            letter-spacing: -0.01em;
            min-width: 0;
          }

          .SidebarItem--selected .SidebarItem__link {
            font-weight: 500;
          }

          .SidebarItem__deleteButton {
             opacity: 0;
             transition: opacity 0.2s ease;
             margin-left: auto;
             padding: 4px;
          }

          .SidebarItem:hover .SidebarItem__deleteButton {
             opacity: 0.7;
          }

           .SidebarItem .SidebarItem__deleteButton:hover {
             opacity: 1 !important;
           }
        `}</style>
      </>
    );
  }
);

SidebarItem.displayName = "SidebarItem";

export default SidebarItem;
