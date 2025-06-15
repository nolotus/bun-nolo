import React, { useState, useRef, useEffect, useCallback, memo } from "react";
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
  PencilIcon,
} from "@primer/octicons-react";
import { FaFileLines } from "react-icons/fa6";
import { createPortal } from "react-dom";
import DeleteContentButton from "./components/DeleteContentButton";
import { selectTheme } from "app/theme/themeSlice";
import {
  selectCurrentSpaceId,
  updateContentTitle,
} from "create/space/spaceSlice";
import { addPendingFile } from "chat/dialog/dialogSlice";
import { nanoid } from "nanoid";
import { useTranslation } from "react-i18next";
import { useInlineEdit } from "render/web/ui/useInlineEdit";
import InlineEditInput from "render/web/ui/InlineEditInput";
import { Tooltip } from "render/web/ui/Tooltip";
import MoveToSpaceSubMenu from "./MoveToSpaceSubMenu";
import toast from "react-hot-toast";

// 最小化的可拖拽组件，仅包裹图标元素
interface ItemDraggableProps {
  id: string;
  containerId: string;
  children: (handleProps: {
    onDragStart: (e: React.DragEvent) => void;
    onDragEnd: (e: React.DragEvent) => void;
  }) => React.ReactNode;
}

const ItemDraggable: React.FC<ItemDraggableProps> = memo(
  ({ id, containerId, children }) => {
    const handleDragStart = (e: React.DragEvent) => {
      e.dataTransfer.setData("itemId", id);
      e.dataTransfer.setData("sourceContainer", containerId);
      e.dataTransfer.setData("dragType", "item");
      e.dataTransfer.effectAllowed = "move";
    };

    const handleDragEnd = (e: React.DragEvent) => {
      // 拖拽结束处理
    };

    return children({ onDragStart: handleDragStart, onDragEnd: handleDragEnd });
  }
);

ItemDraggable.displayName = "ItemDraggable";

interface SidebarItemProps {
  contentKey: string;
  type: "dialog" | "page" | "image" | "doc" | "code" | "file";
  title: string;
  categoryId?: string;
  animate?: boolean;
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
const TOUCH_TARGET_SIZE = 44;

export const SidebarItem: React.FC<SidebarItemProps> = React.memo(
  ({ contentKey, type, title, categoryId, animate = false }) => {
    const { pageKey: pageKeyFromPath } = useParams<{ pageKey?: string }>();
    const theme = useSelector(selectTheme);
    const currentSpaceId = useSelector(selectCurrentSpaceId);
    const dispatch = useDispatch();
    const { t } = useTranslation("chat");

    // --- State ---
    const [isIconHover, setIsIconHover] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isMoveSubMenuOpen, setIsMoveSubMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

    const containerRef = useRef<HTMLDivElement>(null);
    const linkRef = useRef<HTMLAnchorElement>(null);

    // --- Computed ---
    const IconComponent = ITEM_ICONS[type] || FileIcon;
    const displayTitle = title || contentKey;
    const isSelected = pageKeyFromPath === contentKey;
    const isMobile = window.innerWidth <= 768;
    const showActions = isHovered || menuOpen || isMoveSubMenuOpen;

    // --- 标题编辑功能 ---
    const handleSaveTitle = useCallback(
      (newTitle: string) => {
        if (currentSpaceId && newTitle.trim() && newTitle !== title) {
          dispatch(
            updateContentTitle({
              spaceId: currentSpaceId,
              contentKey,
              title: newTitle.trim(),
            })
          );
          toast.success("标题已更新");
        }
      },
      [dispatch, currentSpaceId, contentKey, title]
    );

    const { isEditing, startEditing, inputRef, inputProps } = useInlineEdit({
      initialValue: displayTitle,
      onSave: handleSaveTitle,
      placeholder: "输入标题",
      ariaLabel: "编辑标题",
    });

    // --- Effects ---
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
        return () => document.removeEventListener("click", handleClickOutside);
      }
    }, [menuOpen, isMoveSubMenuOpen]);

    useEffect(() => {
      if (showActions && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const left = Math.min(rect.right - 150, window.innerWidth - 160);
        const top = rect.bottom + 4;
        setMenuPosition({ top, left });
      }
    }, [menuOpen, isMoveSubMenuOpen, showActions]);

    // --- Handlers ---
    const handleAddToConversation = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(
          addPendingFile({
            id: nanoid(),
            name: displayTitle,
            pageKey: contentKey,
            type: "page" as const,
          })
        );
        toast.success(t("addedToConversation"));
      },
      [contentKey, displayTitle, dispatch, t]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (isEditing) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          linkRef.current?.click();
        } else if (e.key === "F2") {
          e.preventDefault();
          startEditing();
        }
      },
      [isEditing, startEditing]
    );

    const handleDoubleClick = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isEditing) startEditing();
      },
      [isEditing, startEditing]
    );

    const handleMenu = {
      toggle: useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setMenuOpen((prev) => !prev);
      }, []),
      edit: useCallback(
        (e: React.MouseEvent) => {
          e.stopPropagation();
          setMenuOpen(false);
          startEditing();
        },
        [startEditing]
      ),
      move: useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMoveSubMenuOpen(true);
      }, []),
    };

    // --- Render Helpers ---
    const ActionButton = ({ onClick, icon: Icon, label, className = "" }) => {
      const ButtonComponent = (
        <button
          className={`SidebarItem__actionButton ${className}`}
          onClick={onClick}
          aria-label={label}
          type="button"
        >
          <Icon size={MORE_ICON_SIZE} />
        </button>
      );

      return isMobile ? (
        ButtonComponent
      ) : (
        <Tooltip content={label} delay={100}>
          {ButtonComponent}
        </Tooltip>
      );
    };

    const MenuItem = ({ onClick, icon: Icon, label, className = "" }) => (
      <button
        className={`SidebarItem__menuItem ${className}`}
        onClick={onClick}
        role="menuitem"
        aria-label={label}
        type="button"
      >
        {Icon && <Icon size={14} style={{ marginRight: "8px" }} />}
        {label}
      </button>
    );

    return (
      <>
        <div
          ref={containerRef}
          className={[
            "SidebarItem",
            isSelected && "SidebarItem--selected",
            isEditing && "SidebarItem--editing",
          ]
            .filter(Boolean)
            .join(" ")}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          aria-selected={isSelected}
        >
          <ItemDraggable id={contentKey} containerId={categoryId || "default"}>
            {({ onDragStart, onDragEnd }) => (
              <span
                className={`SidebarItem__icon ${
                  isIconHover ? "SidebarItem__icon--draggable" : ""
                }`}
                onMouseEnter={() => setIsIconHover(true)}
                onMouseLeave={() => setIsIconHover(false)}
                draggable
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              >
                {isIconHover ? (
                  <GrabberIcon size={ICON_SIZE} />
                ) : (
                  <IconComponent size={ICON_SIZE} />
                )}
              </span>
            )}
          </ItemDraggable>

          {isEditing ? (
            <div className="SidebarItem__editContainer">
              <InlineEditInput inputRef={inputRef} {...inputProps} />
            </div>
          ) : (
            <NavLink
              ref={linkRef}
              to={{
                pathname: `/${contentKey}`,
                search: currentSpaceId ? `?spaceId=${currentSpaceId}` : "",
              }}
              className="SidebarItem__link"
              onClick={(e) => isEditing && e.preventDefault()}
            >
              <span
                className="SidebarItem__linkText"
                onDoubleClick={handleDoubleClick}
                title="双击编辑标题"
              >
                {displayTitle}
              </span>
            </NavLink>
          )}

          {showActions && !isEditing && (
            <div className="SidebarItem__actionButtons">
              <ActionButton
                onClick={handleMenu.toggle}
                icon={KebabHorizontalIcon}
                label="更多操作"
              />
              {contentKey.startsWith("page") && (
                <ActionButton
                  onClick={handleAddToConversation}
                  icon={ChevronRightIcon}
                  label="加入对话"
                />
              )}
            </div>
          )}
        </div>

        {menuOpen &&
          createPortal(
            <div
              className="SidebarItem__menu"
              style={{ position: "absolute", ...menuPosition }}
            >
              <MenuItem
                onClick={handleMenu.edit}
                icon={PencilIcon}
                label="编辑标题"
              />
              <MenuItem onClick={handleMenu.move} label="移动到空间" />
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

        <style jsx>{`
          .SidebarItem {
            margin: 2px 0;
            padding: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            border-radius: 8px;
            position: relative;
            transition: all 0.12s ease;
            color: ${theme.textSecondary};
            min-height: 36px;
            outline: none;
          }
          .SidebarItem:hover {
            background-color: ${theme.backgroundHover};
            color: ${theme.text};
            transform: translateX(2px);
          }
          .SidebarItem:focus-visible {
            box-shadow: 0 0 0 2px ${theme.primary}40;
          }
          .SidebarItem--selected {
            background: linear-gradient(
              90deg,
              ${theme.primaryGhost || "rgba(22, 119, 255, 0.08)"} 0%,
              ${theme.primaryGhost || "rgba(22, 119, 255, 0.04)"} 100%
            );
            color: ${theme.primary};
            transform: translateX(4px);
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
          .SidebarItem--editing {
            background-color: ${theme.backgroundHover};
          }
          .SidebarItem__icon {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 3px;
            border-radius: 6px;
            color: ${theme.textTertiary};
            transition: all 0.12s ease;
            flex-shrink: 0;
            cursor: pointer;
          }
          .SidebarItem__icon--draggable {
            color: ${theme.textSecondary};
            background-color: ${theme.backgroundTertiary};
            cursor: grab;
            transform: scale(1.05);
          }
          .SidebarItem:hover .SidebarItem__icon {
            color: ${theme.textSecondary};
            transform: scale(1.1);
          }
          .SidebarItem--selected .SidebarItem__icon {
            color: ${theme.primary};
          }
          .SidebarItem__editContainer {
            flex: 1;
            min-width: 0;
            padding: 0 2px;
          }
          .SidebarItem__link {
            flex: 1;
            font-size: 14px;
            line-height: 1.4;
            text-decoration: none;
            color: inherit;
            min-width: 0;
          }
          .SidebarItem__linkText {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            cursor: text;
            padding: 2px 4px;
            border-radius: 4px;
            transition: background-color 0.15s ease;
          }
          .SidebarItem__linkText:hover {
            background-color: ${theme.backgroundTertiary}80;
          }
          .SidebarItem--selected .SidebarItem__link {
            font-weight: 500;
          }
          .SidebarItem__actionButtons {
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%) translateX(8px);
            display: flex;
            gap: 2px;
            opacity: 0;
            transition: all 0.15s ease;
            padding: 2px 4px;
            background: ${theme.backgroundTertiary}DD;
            backdrop-filter: blur(8px);
            border-radius: 6px;
          }
          .SidebarItem:hover .SidebarItem__actionButtons {
            opacity: 1;
            transform: translateY(-50%) translateX(0);
          }
          .SidebarItem__actionButton {
            padding: 3px;
            border: none;
            background: none;
            cursor: pointer;
            border-radius: 4px;
            color: ${theme.textTertiary};
            transition: all 0.12s ease;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .SidebarItem__actionButton:hover {
            background-color: ${theme.backgroundTertiary};
            color: ${theme.textSecondary};
            transform: scale(1.1);
          }
          .SidebarItem__menu {
            background: ${theme.backgroundElevated || theme.background};
            border: 1px solid ${theme.border};
            border-radius: 8px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
            padding: 4px;
            z-index: 1000;
            min-width: 150px;
            animation: menuFadeIn 0.15s ease;
          }
          .SidebarItem__menuItem {
            display: flex;
            align-items: center;
            width: 100%;
            padding: 8px 12px;
            font-size: 13px;
            color: ${theme.text};
            background: none;
            border: none;
            cursor: pointer;
            border-radius: 6px;
            transition: all 0.12s ease;
            min-height: 32px;
          }
          .SidebarItem__menuItem:hover {
            background-color: ${theme.backgroundHover};
            transform: translateX(2px);
          }
          .SidebarItem__deleteMenuItem {
            color: ${theme.danger || "#e53e3e"};
          }
          @keyframes menuFadeIn {
            from {
              opacity: 0;
              transform: translateY(-8px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          @media (max-width: 768px) {
            .SidebarItem {
              padding: 12px 8px;
              min-height: ${TOUCH_TARGET_SIZE}px;
            }
            .SidebarItem__actionButtons {
              position: static;
              opacity: 1;
              transform: none;
              margin-left: auto;
              background: transparent;
              backdrop-filter: none;
            }
            .SidebarItem__actionButton {
              width: 32px;
              height: 32px;
              padding: 6px;
            }
          }
        `}</style>
      </>
    );
  }
);

SidebarItem.displayName = "SidebarItem";
export default SidebarItem;
