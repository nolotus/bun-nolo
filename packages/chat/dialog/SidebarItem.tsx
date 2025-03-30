import {
  DiscussionOutdatedIcon,
  FileIcon,
  ImageIcon,
  BookIcon,
  FileCodeIcon,
  GrabberIcon,
} from "@primer/octicons-react";
import { FaFileLines } from "react-icons/fa6";
import { selectTheme } from "app/theme/themeSlice"; // 确认路径
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { NavLink, useParams } from "react-router-dom";
import DeleteContentButton from "./DeleteContentButton"; // 确认路径
import { selectCurrentSpaceId } from "create/space/spaceSlice"; // 确认路径

interface SidebarItemProps {
  contentKey: string; // pageKey/dialogKey 等
  type: "dialog" | "page" | "image" | "doc" | "code" | "file";
  title: string;
  categoryId?: string;
  handleProps?: any; // 用于拖拽
}

// 图标映射
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
    // 从 useParams 获取当前 URL 路径中的 :pageKey 参数
    const { pageKey: pageKeyFromPath } = useParams<{ pageKey?: string }>();
    // 获取 Redux 中的 theme 和 currentSpaceId (用于构建链接)
    const theme = useSelector(selectTheme);
    const currentSpaceId = useSelector(selectCurrentSpaceId);
    // 控制拖拽图标显示的 state
    const [isIconHover, setIsIconHover] = useState(false);

    const IconComponent = ITEM_ICONS[type] || FileIcon;
    const displayTitle = title || contentKey; // 优先显示 title

    // *** 修改: 简化 isSelected 判断逻辑，只比较 pageKey ***
    const isSelected = pageKeyFromPath === contentKey;

    // 构建 CSS 类名
    const rootClassName =
      `SidebarItem ${isSelected ? "SidebarItem--selected" : ""}`.trim();
    const iconClassName =
      `SidebarItem__icon ${isIconHover && handleProps ? "SidebarItem__icon--draggable" : ""}`.trim();

    // 构建目标 URL 对象，仍然包含 spaceId 查询参数（如果存在）
    const targetUrlObject = {
      pathname: `/${contentKey}`,
      search: currentSpaceId ? `?spaceId=${currentSpaceId}` : "",
    };

    return (
      <>
        <div className={rootClassName}>
          <span
            className={iconClassName}
            {...handleProps} // 应用拖拽 props
            onMouseEnter={() => setIsIconHover(true)}
            onMouseLeave={() => setIsIconHover(false)}
            title={isIconHover && handleProps ? "拖拽排序" : ""} // 拖拽提示
          >
            {/* 显示拖拽或类型图标 */}
            {isIconHover && handleProps ? (
              <GrabberIcon size={ICON_SIZE} />
            ) : (
              <IconComponent size={ICON_SIZE} />
            )}
          </span>
          {/* 使用 NavLink 实现路由跳转 */}
          <NavLink
            to={targetUrlObject} // 目标 URL 对象
            className="SidebarItem__link"
            title={displayTitle} // 完整标题提示
          >
            {displayTitle}
          </NavLink>

          {/* 删除按钮 */}
          <DeleteContentButton
            contentKey={contentKey}
            title={displayTitle}
            theme={theme}
            className="SidebarItem__deleteButton"
          />
        </div>

        {/* --- CSS 样式 --- */}
        <style>{`
           .SidebarItem { margin: 2px 0; padding: 7px 10px; display: flex; align-items: center; gap: 10px; cursor: pointer; border-radius: 8px; position: relative; transition: background-color 0.15s ease, color 0.15s ease; color: ${theme.textSecondary}; user-select: none; min-height: 36px; }
           .SidebarItem:hover { background-color: ${theme.backgroundHover}; color: ${theme.text}; }
           .SidebarItem--selected { background-color: ${theme.primaryGhost || "rgba(22, 119, 255, 0.08)"}; color: ${theme.primary}; }
           .SidebarItem--selected::before { content: ""; position: absolute; left: -6px; top: 50%; transform: translateY(-50%); width: 3px; height: 16px; background: ${theme.primary}; border-radius: 0 2px 2px 0; }
           .SidebarItem__icon { display: flex; align-items: center; justify-content: center; padding: 3px; border-radius: 6px; color: ${theme.textTertiary}; transition: color 0.2s ease, background-color 0.2s ease; flex-shrink: 0; }
           .SidebarItem__icon--draggable { color: ${theme.textSecondary}; background-color: ${theme.backgroundTertiary}; cursor: grab; }
           .SidebarItem__icon--draggable:active { cursor: grabbing; }
           .SidebarItem:hover .SidebarItem__icon { color: ${theme.textSecondary}; }
           .SidebarItem--selected .SidebarItem__icon { color: ${theme.primary}; }
           .SidebarItem__link { font-size: 14px; line-height: 1.4; flex-grow: 1; font-weight: 400; text-decoration: none; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: inherit; transition: color 0.15s ease, font-weight 0.15s ease; letter-spacing: -0.01em; min-width: 0; }
           .SidebarItem--selected .SidebarItem__link { font-weight: 500; }
           .SidebarItem__deleteButton { opacity: 0; transition: opacity 0.2s ease; margin-left: auto; padding: 4px; }
           .SidebarItem:hover .SidebarItem__deleteButton { opacity: 0.7; }
           .SidebarItem .SidebarItem__deleteButton:hover { opacity: 1 !important; }
        `}</style>
      </>
    );
  }
);

SidebarItem.displayName = "SidebarItem";

export default SidebarItem;
