// SidebarItem.tsx
import React, { useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
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
import { selectCurrentSpaceId } from "create/space/spaceSlice";
import SidebarActions from "./SidebarActions";

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
    const { pageKey: pageKeyFromPath } = useParams<{ pageKey?: string }>();
    const theme = useSelector(selectTheme);
    const currentSpaceId = useSelector(selectCurrentSpaceId);
    const [isIconHover, setIsIconHover] = useState(false);
    const IconComponent = ITEM_ICONS[type] || FileIcon;
    const displayTitle = title || contentKey;
    const isSelected = pageKeyFromPath === contentKey;

    const handleMoveClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      console.log(`请求移动内容: ${contentKey}`);
    };

    return (
      <>
        <div
          className={`SidebarItem ${isSelected ? "SidebarItem--selected" : ""}`}
        >
          {/* 拖拽/类型图标 */}
          <span
            className={`SidebarItem__icon ${
              isIconHover && handleProps ? "SidebarItem__icon--draggable" : ""
            }`}
            {...handleProps}
            onMouseEnter={() => setIsIconHover(true)}
            onMouseLeave={() => setIsIconHover(false)}
            title={isIconHover && handleProps ? "拖拽排序" : ""}
          >
            {isIconHover && handleProps ? (
              <GrabberIcon size={ICON_SIZE} />
            ) : (
              <IconComponent size={ICON_SIZE} />
            )}
          </span>

          {/* 标题链接 */}
          <NavLink
            to={{
              pathname: `/${contentKey}`,
              search: currentSpaceId ? `?spaceId=${currentSpaceId}` : "",
            }}
            className="SidebarItem__link"
            title={displayTitle}
          >
            {displayTitle}
          </NavLink>

          {/* 操作按钮区域，调用独立的 SidebarActions 组件 */}
          <SidebarActions
            contentKey={contentKey}
            displayTitle={displayTitle}
            theme={theme}
            onMove={handleMoveClick}
          />
        </div>

        {/* 内联 CSS 样式 */}
        <style>{`
           .SidebarItem { 
             margin: 2px 0; 
             padding: 7px 10px; 
             display: flex; 
             align-items: center; 
             gap: 10px; 
             cursor: pointer; 
             border-radius: 8px; 
             position: relative; 
             transition: background-color 0.2s, color 0.2s; 
             color: ${theme.textSecondary}; 
             min-height: 36px; 
             overflow: hidden;
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
             height: 18px; 
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
             transition: color 0.2s, background-color 0.2s; 
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
             transition: color 0.15s, font-weight 0.15s; 
             min-width: 0; 
           }
           
           .SidebarItem--selected .SidebarItem__link { 
             font-weight: 500; 
           }
           
           .SidebarItem__actionButtons {
             position: absolute;
             right: 8px;
             top: 50%;
             transform: translateY(-50%);
             display: flex;
             align-items: center;
             gap: 5px;
             opacity: 0;
             pointer-events: none;
             transition: opacity 0.2s, background-color 0.2s, backdrop-filter 0.2s;
             z-index: 1;
             border-radius: 6px;
             padding: 3px 5px;
           }

           .SidebarItem:hover .SidebarItem__actionButtons {
             opacity: 1;
             pointer-events: auto;
             background-color: ${theme.backgroundTertiary}CC;
             backdrop-filter: blur(8px);
             -webkit-backdrop-filter: blur(8px);
           }

           .SidebarItem__deleteButton,
           .SidebarItem__moreButton {
             padding: 4px;
             border: none;
             background: none;
             cursor: pointer;
             border-radius: 4px;
             display: flex;
             align-items: center;
             justify-content: center;
             color: ${theme.textTertiary};
             transition: background-color 0.15s, color 0.15s;
           }

           .SidebarItem__deleteButton:hover,
           .SidebarItem__moreButton:hover {
             background-color: ${theme.backgroundTertiaryHover || theme.backgroundTertiary};
             color: ${theme.textSecondary};
           }
           
           .SidebarItem__menu {
             position: absolute;
             top: calc(100% + 4px);
             right: 0;
             background-color: ${theme.backgroundElevated || theme.background};
             border: 1px solid ${theme.border};
             border-radius: 6px;
             box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
             padding: 4px;
             z-index: 10;
             min-width: 150px;
             animation: fadeIn 0.15s ease-out;
           }
           
           .SidebarItem__menuItem {
             display: block;
             width: 100%;
             text-align: left;
             padding: 8px 12px;
             font-size: 13px;
             line-height: 1.4;
             color: ${theme.text};
             background: none;
             border: none;
             cursor: pointer;
             border-radius: 4px;
             transition: background-color 0.15s;
             white-space: nowrap;
           }
           
           .SidebarItem__menuItem:hover {
             background-color: ${theme.backgroundHover};
           }
           
           @keyframes fadeIn {
             from { opacity: 0; transform: translateY(-5px); }
             to { opacity: 1; transform: translateY(0); }
           }
        `}</style>
      </>
    );
  }
);

SidebarItem.displayName = "SidebarItem";
export default SidebarItem;
