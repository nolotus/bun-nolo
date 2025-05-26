import React, { useState, useRef, useEffect, useCallback } from "react";
import { NavLink, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  DiscussionOutdatedIcon,
  FileIcon,
  ImageIcon,
  BookIcon,
  FileCodeIcon,
  GrabberIcon,
  KebabHorizontalIcon,
  ChevronRightIcon,
} from "@primer/octicons-react";
import { FaFileLines } from "react-icons/fa6";
import { createPortal } from "react-dom";
import DeleteContentButton from "./components/DeleteContentButton";
import { selectTheme } from "app/theme/themeSlice";
import { selectCurrentSpaceId } from "create/space/spaceSlice";
import MoveToSpaceSubMenu from "./MoveToSpaceSubMenu";
import { addPendingFile } from "chat/dialog/dialogSlice"; // 引入 action
import { nanoid } from "nanoid";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

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
const MORE_ICON_SIZE = 16;
const TOUCH_TARGET_SIZE = 44; // 移动端推荐触摸目标尺寸

export const SidebarItem: React.FC<SidebarItemProps> = React.memo(
  ({ contentKey, type, title, handleProps }) => {
    const { pageKey: pageKeyFromPath } = useParams<{ pageKey?: string }>();
    const theme = useSelector(selectTheme);
    const currentSpaceId = useSelector(selectCurrentSpaceId);
    const dispatch = useDispatch(); // 使用 dispatch 来触发 Redux 动作
    const { t } = useTranslation("chat"); // 用于翻译提示信息
    const [isIconHover, setIsIconHover] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isMoveSubMenuOpen, setIsMoveSubMenuOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const linkRef = useRef<HTMLAnchorElement>(null);
    const tooltipTimeoutRef = useRef<NodeJS.Timeout>();

    const IconComponent = ITEM_ICONS[type] || FileIcon;
    const displayTitle = title || contentKey;
    const isSelected = pageKeyFromPath === contentKey;

    // 检测移动端
    useEffect(() => {
      const checkIsMobile = () => {
        setIsMobile(window.innerWidth <= 768 || "ontouchstart" in window);
      };

      checkIsMobile();
      window.addEventListener("resize", checkIsMobile);
      return () => window.removeEventListener("resize", checkIsMobile);
    }, []);

    // 拖拽处理
    const handleDragStart = useCallback(
      (e: React.DragEvent) => {
        setIsDragging(true);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", contentKey);
      },
      [contentKey]
    );

    const handleDragEnd = useCallback(() => {
      setIsDragging(false);
    }, []);

    // 工具提示处理
    const showTooltip = useCallback(() => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
      tooltipTimeoutRef.current = setTimeout(() => {
        setIsTooltipVisible(true);
      }, 800);
    }, []);

    const hideTooltip = useCallback(() => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
      setIsTooltipVisible(false);
    }, []);

    // 菜单处理
    const handleToggleMenu = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setMenuOpen((prev) => !prev);
    }, []);

    const handleMoveClick = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setIsMoveSubMenuOpen(true);
    }, []);

    // 将当前项加入到当前对话的待处理文件列表（仅支持 page 类型）
    const handleAddToConversation = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();

        // 创建一个新的 PendingFile 对象，类型映射为 docx（或其他类型）
        const newFile = {
          id: nanoid(),
          name: displayTitle,
          pageKey: contentKey, // 使用 contentKey 作为 pageKey
          type: "page" as const, // 将 page 类型映射为一个新类型
        };

        // 触发 Redux 动作，将文件添加到 pendingFiles
        dispatch(addPendingFile(newFile));
        toast.success(t("addedToConversation"));
      },
      [contentKey, type, displayTitle, dispatch, t]
    );

    // 键盘导航处理
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        linkRef.current?.click();
      }
    }, []);

    // 外部点击监听
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setMenuOpen(false);
          setIsMoveSubMenuOpen(false);
        }
      };

      if (menuOpen || isMoveSubMenuOpen) {
        document.addEventListener("click", handleClickOutside);
      }

      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }, [menuOpen, isMoveSubMenuOpen]);

    // 计算菜单位置 - 移动端适配
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    useEffect(() => {
      if ((menuOpen || isMoveSubMenuOpen) && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let left = rect.right + window.scrollX - 150;
        let top = rect.bottom + window.scrollY + 4;

        // 移动端调整
        if (isMobile) {
          // 确保菜单不超出屏幕
          if (left + 150 > viewportWidth) {
            left = viewportWidth - 160;
          }
          if (top + 100 > viewportHeight) {
            top = rect.top + window.scrollY - 100;
          }
        }

        setMenuPosition({ top, left });
      }
    }, [menuOpen, isMoveSubMenuOpen, isMobile]);

    // 清理定时器
    useEffect(() => {
      return () => {
        if (tooltipTimeoutRef.current) {
          clearTimeout(tooltipTimeoutRef.current);
        }
      };
    }, []);

    return (
      <>
        <div
          ref={containerRef}
          className={`SidebarItem ${isSelected ? "SidebarItem--selected" : ""} ${
            isDragging ? "SidebarItem--dragging" : ""
          }`}
          onMouseEnter={() => {
            setIsHovered(true);
            showTooltip();
          }}
          onMouseLeave={() => {
            setIsHovered(false);
            hideTooltip();
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="button"
          aria-label={`${displayTitle} - ${type}类型内容`}
          aria-selected={isSelected}
        >
          <span
            className={`SidebarItem__icon ${
              isIconHover && handleProps ? "SidebarItem__icon--draggable" : ""
            }`}
            {...(handleProps && {
              ...handleProps,
              draggable: true,
              onDragStart: handleDragStart,
              onDragEnd: handleDragEnd,
            })}
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

          <NavLink
            ref={linkRef}
            to={{
              pathname: `/${contentKey}`,
              search: currentSpaceId ? `?spaceId=${currentSpaceId}` : "",
            }}
            className="SidebarItem__link"
            title={displayTitle}
            aria-label={`打开${displayTitle}`}
          >
            <span className="SidebarItem__linkText">{displayTitle}</span>
          </NavLink>

          {(isHovered || isFocused || menuOpen || isMoveSubMenuOpen) && (
            <div className="SidebarItem__actionButtons">
              <button
                className="SidebarItem__moreButton"
                onClick={handleToggleMenu}
                aria-haspopup="true"
                aria-expanded={menuOpen}
                aria-label="更多操作"
                style={{
                  minHeight: isMobile ? `${TOUCH_TARGET_SIZE}px` : "auto",
                }}
              >
                <KebabHorizontalIcon size={MORE_ICON_SIZE} />
              </button>

              {/* 只在 contentKey 以 "page" 开头时显示向右箭头按钮 */}
              {contentKey.startsWith("page") && (
                <button
                  className="SidebarItem__addToConversationButton"
                  onClick={handleAddToConversation}
                  aria-label="加入到当前对话"
                  style={{
                    minHeight: isMobile ? `${TOUCH_TARGET_SIZE}px` : "auto",
                  }}
                >
                  <ChevronRightIcon size={MORE_ICON_SIZE} />
                </button>
              )}
            </div>
          )}

          {/* 工具提示 */}
          {isTooltipVisible && !menuOpen && !isMobile && (
            <div className="SidebarItem__tooltip">{displayTitle}</div>
          )}
        </div>

        {menuOpen &&
          createPortal(
            <div
              className="SidebarItem__menu"
              role="menu"
              aria-orientation="vertical"
              style={{
                position: "absolute",
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
              }}
            >
              <button
                className="SidebarItem__menuItem"
                onClick={handleMoveClick}
                role="menuitem"
                aria-label="移动到其他空间"
              >
                移动到空间
              </button>
              <DeleteContentButton
                contentKey={contentKey}
                title={displayTitle}
                theme={theme}
                className="SidebarItem__menuItem SidebarItem__deleteMenuItem"
              />
            </div>,
            document.body
          )}

        {isMoveSubMenuOpen &&
          createPortal(
            <MoveToSpaceSubMenu
              position={{
                top: menuPosition.top,
                left: menuPosition.left + 160,
              }}
              contentKey={contentKey}
              onClose={() => {
                setIsMoveSubMenuOpen(false);
                setMenuOpen(false);
              }}
            />,
            document.body
          )}

        <style href="sidebar-item" precedence="medium">{`
          .SidebarItem {
            margin: 2px 0;
            padding: ${isMobile ? "12px 8px" : "8px"};
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            border-radius: 8px;
            position: relative;
            transition: background-color 0.12s cubic-bezier(0.4, 0, 0.2, 1), 
                       color 0.12s cubic-bezier(0.4, 0, 0.2, 1), 
                       transform 0.12s cubic-bezier(0.4, 0, 0.2, 1);
            color: ${theme.textSecondary};
            min-height: ${isMobile ? `${TOUCH_TARGET_SIZE}px` : "36px"};
            will-change: transform, background-color;
            -webkit-tap-highlight-color: transparent;
            contain: layout style paint;
            outline: none;
          }

          .SidebarItem:hover {
            background-color: ${theme.backgroundHover};
            color: ${theme.text};
            transform: translateX(2px);
          }

          .SidebarItem:focus-visible {
            background-color: ${theme.backgroundHover};
            color: ${theme.text};
            box-shadow: 0 0 0 2px ${theme.primary}40;
          }

          .SidebarItem:active {
            transform: scale(0.98) translateX(2px);
          }

          .SidebarItem--selected {
            background: linear-gradient(90deg, 
              ${theme.primaryGhost || "rgba(22, 119, 255, 0.08)"} 0%, 
              ${theme.primaryGhost || "rgba(22, 119, 255, 0.04)"} 100%);
            color: ${theme.primary};
            transform: translateX(4px);
          }

          .SidebarItem--selected::before {
            content: "";
            position: absolute;
            left: -6px;
            top: 50%;
            transform: translateY(-50%) scaleY(1);
            width: 3px;
            height: 18px;
            background: ${theme.primary};
            border-radius: 0 2px 2px 0;
            transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
            transform-origin: center;
          }

          .SidebarItem--dragging {
            opacity: 0.6;
            transform: scale(1.02);
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          .SidebarItem__icon {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 3px;
            border-radius: 6px;
            color: ${theme.textTertiary};
            transition: color 0.12s cubic-bezier(0.4, 0, 0.2, 1), 
                       background-color 0.12s cubic-bezier(0.4, 0, 0.2, 1),
                       transform 0.12s cubic-bezier(0.4, 0, 0.2, 1);
            flex-shrink: 0;
          }

          .SidebarItem__icon--draggable {
            color: ${theme.textSecondary};
            background-color: ${theme.backgroundTertiary};
            cursor: grab;
            transform: scale(1.05);
          }

          .SidebarItem__icon--draggable:active {
            cursor: grabbing;
            transform: scale(0.95);
          }

          .SidebarItem:hover .SidebarItem__icon {
            color: ${theme.textSecondary};
            transform: scale(1.1);
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
            color: inherit;
            transition: color 0.12s cubic-bezier(0.4, 0, 0.2, 1), 
                       font-weight 0.12s cubic-bezier(0.4, 0, 0.2, 1);
            min-width: 0;
            display: block;
          }

          .SidebarItem__linkText {
            display: block;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            position: relative;
          }

          .SidebarItem__linkText::after {
            content: "";
            position: absolute;
            top: 0;
            right: 0;
            width: 20px;
            height: 100%;
            background: linear-gradient(to right, transparent, ${theme.background || "#ffffff"});
            opacity: 0;
            transition: opacity 0.2s;
          }

          .SidebarItem:hover .SidebarItem__linkText::after {
            opacity: 1;
          }

          .SidebarItem--selected .SidebarItem__link {
            font-weight: 500;
          }

          .SidebarItem__actionButtons {
            position: absolute;
            right: 0px;
            top: 50%;
            transform: translateY(-50%) translateX(8px);
            display: flex;
            align-items: center;
            gap: ${isMobile ? "8px" : "5px"};
            opacity: 0;
            pointer-events: auto;
            transition: opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1), 
                       transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1),
                       background-color 0.12s;
            z-index: 1;
            border-radius: 6px;
            padding: ${isMobile ? "6px 8px" : "3px 5px"};
            background-color: ${theme.backgroundTertiary}DD;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            will-change: opacity, transform;
          }

          .SidebarItem:hover .SidebarItem__actionButtons,
          .SidebarItem:focus-visible .SidebarItem__actionButtons {
            opacity: 1;
            transform: translateY(-50%) translateX(0);
          }

          .SidebarItem__moreButton,
          .SidebarItem__addToConversationButton {
            padding: ${isMobile ? "8px" : "4px"};
            border: none;
            background: none;
            cursor: pointer;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${theme.textTertiary};
            transition: background-color 0.12s cubic-bezier(0.4, 0, 0.2, 1), 
                       color 0.12s cubic-bezier(0.4, 0, 0.2, 1), 
                       transform 0.1s cubic-bezier(0.34, 1.56, 0.64, 1);
            min-width: ${isMobile ? `${TOUCH_TARGET_SIZE}px` : "auto"};
            position: relative;
            overflow: hidden;
          }

          .SidebarItem__moreButton::before,
          .SidebarItem__addToConversationButton::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: ${theme.textSecondary}20;
            transform: translate(-50%, -50%);
            transition: width 0.3s, height 0.3s;
          }

          .SidebarItem__moreButton:active::before,
          .SidebarItem__addToConversationButton:active::before {
            width: 40px;
            height: 40px;
          }

          .SidebarItem__moreButton:hover,
          .SidebarItem__addToConversationButton:hover {
            background-color: ${theme.backgroundTertiaryHover || theme.backgroundTertiary};
            color: ${theme.textSecondary};
            transform: scale(1.1);
          }

          .SidebarItem__moreButton:active,
          .SidebarItem__addToConversationButton:active {
            transform: scale(0.9);
          }

          .SidebarItem__tooltip {
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: ${theme.textPrimary || theme.text};
            color: ${theme.background};
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            white-space: nowrap;
            z-index: 1000;
            margin-bottom: 5px;
            animation: tooltipFadeIn 0.15s ease-out;
          }

          .SidebarItem__tooltip::after {
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            transform: translateX(-50%);
            border: 4px solid transparent;
            border-top-color: ${theme.textPrimary || theme.text};
          }

          .SidebarItem__menu {
            background-color: ${theme.backgroundElevated || theme.background};
            border: 1px solid ${theme.border};
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            padding: 4px;
            z-index: 1000;
            min-width: ${isMobile ? "180px" : "150px"};
            animation: menuFadeIn 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
            contain: layout style paint;
          }

          .SidebarItem__menuItem {
            display: block;
            width: 100%;
            text-align: left;
            padding: ${isMobile ? "12px 16px" : "8px 12px"};
            font-size: 13px;
            line-height: 1.4;
            color: ${theme.text};
            background: none;
            border: none;
            cursor: pointer;
            border-radius: 4px;
            transition: background-color 0.12s cubic-bezier(0.4, 0, 0.2, 1), 
                       transform 0.1s cubic-bezier(0.34, 1.56, 0.64, 1);
            white-space: nowrap;
            position: relative;
            overflow: hidden;
            min-height: ${isMobile ? `${TOUCH_TARGET_SIZE}px` : "auto"};
            display: flex;
            align-items: center;
          }

          .SidebarItem__menuItem::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: ${theme.textSecondary}15;
            transform: translate(-50%, -50%);
            transition: width 0.3s, height 0.3s;
          }

          .SidebarItem__menuItem:active::before {
            width: 100%;
            height: 100%;
          }

          .SidebarItem__menuItem:hover {
            background-color: ${theme.backgroundHover};
            transform: translateX(2px);
          }

          .SidebarItem__menuItem:active {
            transform: scale(0.98) translateX(2px);
          }

          .SidebarItem__deleteMenuItem {
            color: ${theme.danger || "#e53e3e"};
          }

          .SidebarItem__deleteMenuItem:hover {
            background-color: ${theme.backgroundHover};
            color: ${theme.danger || "#e53e3e"};
          }

          @keyframes tooltipFadeIn {
            from { opacity: 0; transform: translateX(-50%) translateY(5px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
          }

          @keyframes menuFadeIn {
            from { opacity: 0; transform: translateY(-8px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }

          @media (prefers-reduced-motion: reduce) {
            .SidebarItem,
            .SidebarItem__icon,
            .SidebarItem__link,
            .SidebarItem__actionButtons,
            .SidebarItem__moreButton,
            .SidebarItem__addToConversationButton,
            .SidebarItem__menuItem {
              transition: none;
              animation: none;
            }
          }

          @media (max-width: 768px) {
            .SidebarItem__actionButtons {
              position: static;
              opacity: 1;
              transform: none;
              margin-left: auto;
              background-color: transparent;
              backdrop-filter: none;
              padding: 0;
            }
          }
        `}</style>
      </>
    );
  }
);

SidebarItem.displayName = "SidebarItem";
export default SidebarItem;
