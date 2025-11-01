// SidebarItem.tsx
import React, {
  useState,
  useRef,
  useCallback,
  forwardRef,
  useEffect,
} from "react";
import { NavLink, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "app/store";
import {
  useFloating,
  useClick,
  useDismiss,
  useInteractions,
  FloatingPortal,
  offset,
  flip,
  shift,
  autoUpdate,
} from "@floating-ui/react";
import { useTranslation } from "react-i18next";
import { nanoid } from "nanoid";
import toast from "react-hot-toast";

import {
  LuMessageSquare,
  LuFileText,
  LuImage,
  LuBook,
  LuFileCode,
  LuFile,
  LuGripVertical,
  LuEllipsis,
  LuPencil,
  LuSquare,
  LuSquareCheck,
  LuChevronRight,
  LuPlus,
  LuFolderSymlink,
} from "react-icons/lu";

import {
  selectCurrentSpaceId,
  updateContentTitle,
} from "create/space/spaceSlice";
import { addPendingFile } from "chat/dialog/dialogSlice";
import { useInlineEdit } from "render/web/ui/useInlineEdit";
import InlineEditInput from "render/web/ui/InlineEditInput";
import { Tooltip } from "render/web/ui/Tooltip";
import DeleteContentButton from "./components/DeleteContentButton";
import SidebarMoveToPanel from "./SidebarMoveToPanel";

const ICON_SIZE = 16;
type ItemType = keyof typeof ITEM_ICONS;
type SidebarItemProps = {
  contentKey: string;
  type: ItemType;
  title: string;
  categoryId?: string;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelectItem?: (contentKey: string) => void;
  style?: React.CSSProperties;
  isMenuOpen: boolean;
  onToggleMenu: (key: string | null) => void;
};

const ITEM_ICONS = {
  dialog: LuMessageSquare,
  page: LuFileText,
  image: LuImage,
  doc: LuBook,
  code: LuFileCode,
  file: LuFile,
} as const;

const SidebarActionButton = forwardRef<
  HTMLButtonElement,
  {
    onClick?: (e: React.MouseEvent) => void;
    icon: React.ElementType;
    label: string;
  }
>(({ onClick, icon: Icon, label }, ref) => (
  <button
    ref={ref}
    className="SidebarItem__action-button"
    onClick={onClick}
    aria-label={label}
    type="button"
  >
    <Icon size={16} />
  </button>
));

const SidebarMenuItem = forwardRef<
  HTMLButtonElement,
  {
    onClick: (e: React.MouseEvent) => void;
    icon: React.ElementType;
    label: string;
    isSubMenu?: boolean;
  }
>(({ onClick, icon: Icon, label, isSubMenu = false }, ref) => (
  <button
    ref={ref}
    className="SidebarItem__menu-item"
    onClick={onClick}
    role="menuitem"
    type="button"
  >
    <Icon size={16} className="SidebarItem__menu-item-icon" />
    <span>{label}</span>
    {isSubMenu && (
      <LuChevronRight size={16} className="SidebarItem__submenu-indicator" />
    )}
  </button>
));

const SidebarItem = forwardRef<HTMLDivElement, SidebarItemProps>(
  (
    {
      contentKey,
      type,
      title,
      categoryId,
      isSelectionMode = false,
      isSelected = false,
      onSelectItem,
      style,
      isMenuOpen,
      onToggleMenu,
    },
    outerRef
  ) => {
    const { t } = useTranslation("space");
    const { pageKey: activePageKey } = useParams<{ pageKey?: string }>();
    const dispatch = useAppDispatch();
    const currentSpaceId = useAppSelector(selectCurrentSpaceId);

    const [isDragging, setIsDragging] = useState(false);
    const [movePanelOpen, setMovePanelOpen] = useState(false);

    const linkRef = useRef<HTMLAnchorElement>(null);
    const isMenuOrPanelOpen = isMenuOpen || movePanelOpen;

    const { refs, floatingStyles, context } = useFloating({
      open: isMenuOrPanelOpen,
      onOpenChange: (open) => {
        if (!open) {
          onToggleMenu(null);
        }
      },
      placement: "right-start",
      strategy: "fixed",
      middleware: [
        offset(4),
        flip(),
        shift({ padding: 8, rootBoundary: "viewport" }),
      ],
      whileElementsMounted: autoUpdate,
    });

    useEffect(() => {
      if (!isMenuOpen) {
        setMovePanelOpen(false);
      }
    }, [isMenuOpen]);

    const { getReferenceProps, getFloatingProps } = useInteractions([
      useClick(context),
      useDismiss(context),
    ]);

    const { isEditing, startEditing, inputRef, inputProps } = useInlineEdit({
      initialValue: title,
      onSave: (newTitle) => {
        if (currentSpaceId && newTitle.trim()) {
          dispatch(
            updateContentTitle({
              spaceId: currentSpaceId,
              contentKey,
              title: newTitle.trim(),
            })
          );
        }
      },
      placeholder: t("titlePlaceholder"),
    });

    const handleAddToConversation = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        dispatch(
          addPendingFile({
            id: nanoid(),
            name: title || contentKey,
            pageKey: contentKey,
            type: "page" as const,
          })
        );
        toast.success(t("addedToConversation"));
      },
      [contentKey, title, dispatch, t]
    );

    const handleContainerClick = (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest(".SidebarItem__actions")) return;
      if (isSelectionMode && onSelectItem) {
        e.preventDefault();
        onSelectItem(contentKey);
      }
    };

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (isEditing) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (isSelectionMode && onSelectItem) {
            onSelectItem(contentKey);
          } else {
            linkRef.current?.click();
          }
        } else if (e.key === "F2" && !isSelectionMode) {
          e.preventDefault();
          startEditing();
        }
      },
      [isEditing, isSelectionMode, onSelectItem, contentKey, startEditing]
    );

    const handleDragStart = (e: React.DragEvent) => {
      setIsDragging(true);
      onToggleMenu(null);
      e.dataTransfer.setData("itemId", contentKey);
      e.dataTransfer.setData("sourceContainer", categoryId || "default");
      e.dataTransfer.setData("dragType", "item");
      e.dataTransfer.effectAllowed = "move";
    };

    const handleDragEnd = () => setIsDragging(false);

    const IconComponent = ITEM_ICONS[type] || LuFile;
    const isActive = activePageKey === contentKey;
    const displayTitle = title || contentKey;
    const itemClasses = [
      "SidebarItem",
      isActive && "SidebarItem--state-active",
      isEditing && "SidebarItem--state-editing",
      isSelectionMode && "SidebarItem--mode-selection",
      isSelected && "SidebarItem--state-selected",
      isDragging && "SidebarItem--state-dragging",
      isMenuOrPanelOpen && "SidebarItem--state-menu-open",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <>
        <div
          ref={outerRef}
          className={itemClasses}
          onClick={handleContainerClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          aria-selected={isActive || isSelected}
          style={style}
        >
          {isSelectionMode ? (
            <div className="SidebarItem__selection-checkbox-wrapper">
              {isSelected ? (
                <LuSquareCheck
                  size={ICON_SIZE}
                  className="SidebarItem__selection-checkbox SidebarItem__selection-checkbox--checked"
                />
              ) : (
                <LuSquare
                  size={ICON_SIZE}
                  className="SidebarItem__selection-checkbox"
                />
              )}
            </div>
          ) : (
            <div
              className="SidebarItem__icon-wrapper"
              draggable
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <IconComponent
                size={ICON_SIZE}
                className="SidebarItem__content-icon"
              />
              <div className="SidebarItem__drag-handle">
                <LuGripVertical size={14} />
              </div>
            </div>
          )}
          {isEditing ? (
            <InlineEditInput inputRef={inputRef} {...inputProps} />
          ) : (
            <NavLink
              ref={linkRef}
              to={
                currentSpaceId
                  ? `/${contentKey}?spaceId=${currentSpaceId}`
                  : `/${contentKey}`
              }
              className="SidebarItem__content-link"
              draggable={false}
            >
              <span className="SidebarItem__content-title" title={displayTitle}>
                {displayTitle}
              </span>
            </NavLink>
          )}
          {!isEditing && !isSelectionMode && (
            <div className="SidebarItem__actions">
              {type === "page" && (
                <Tooltip content={t("joinConversation")}>
                  <SidebarActionButton
                    onClick={handleAddToConversation}
                    icon={LuPlus}
                    label={t("joinConversation")}
                  />
                </Tooltip>
              )}
              <div
                ref={refs.setReference}
                {...getReferenceProps({
                  onClick: (e) => {
                    e.stopPropagation();
                    onToggleMenu(contentKey);
                  },
                })}
              >
                <Tooltip content={t("moreActions")}>
                  <SidebarActionButton
                    icon={LuEllipsis}
                    label={t("moreActions")}
                  />
                </Tooltip>
              </div>
            </div>
          )}
        </div>

        {isMenuOrPanelOpen && !isDragging && (
          <FloatingPortal>
            <div
              ref={refs.setFloating}
              style={{ ...floatingStyles, zIndex: 1000 }}
              {...getFloatingProps()}
            >
              {isMenuOpen && !movePanelOpen && (
                <div className="SidebarItem__context-menu" role="menu">
                  <SidebarMenuItem
                    onClick={() => {
                      startEditing();
                      onToggleMenu(null);
                    }}
                    icon={LuPencil}
                    label={t("editTitle")}
                  />
                  <SidebarMenuItem
                    onClick={() => setMovePanelOpen(true)}
                    icon={LuFolderSymlink}
                    label={t("moveToSpace")}
                    isSubMenu
                  />
                  <DeleteContentButton
                    contentKey={contentKey}
                    title={displayTitle}
                    as={SidebarMenuItem}
                    onDelete={() => onToggleMenu(null)}
                  />
                </div>
              )}
              {movePanelOpen && (
                <SidebarMoveToPanel
                  contentKey={contentKey}
                  onClose={() => {
                    setMovePanelOpen(false);
                    onToggleMenu(null);
                  }}
                />
              )}
            </div>
          </FloatingPortal>
        )}

        <style href="SidebarItem-styles" precedence="default">
          {`
            .SidebarItem {
              position: relative;
              display: flex;
              align-items: center;
              gap: var(--space-2);
              padding: var(--space-1) var(--space-2);
              border-radius: 8px;
              transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
              color: var(--text);
              min-height: 36px;
              outline: none;
              border: 1px solid transparent;
              cursor: pointer;
              font-size: 0.875rem;
            }

            .SidebarItem--state-dragging { 
              opacity: 0.4; 
              transform: scale(0.96);
              box-shadow: 0 6px 20px var(--shadowMedium);
            }

            .SidebarItem:hover,
            .SidebarItem:focus-visible,
            .SidebarItem--state-menu-open {
              background-color: var(--backgroundHover);
              transform: translateX(3px);
              box-shadow: 0 1px 3px var(--shadowLight);
            }

            .SidebarItem:focus-visible {
              outline: 2px solid var(--primary);
              outline-offset: 2px;
            }

            .SidebarItem--state-active {
              background: var(--primaryGhost);
              color: var(--primary);
              border-color: color-mix(in srgb, var(--primary) 20%, transparent);
              font-weight: 600; /* 提升到 600，Windows 上更明显 */
              transform: translateX(4px);
              box-shadow: 0 2px 6px color-mix(in srgb, var(--primary) 12%, transparent);
            }

            .SidebarItem--state-active::before {
              content: "";
              position: absolute;
              left: -3px;
              top: 50%;
              transform: translateY(-50%);
              width: 4px;
              height: 24px;
              background: var(--primary);
              border-radius: 0 3px 3px 0;
            }

            .SidebarItem__icon-wrapper {
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: grab;
              width: 20px;
              height: 20px;
              flex-shrink: 0;
              border-radius: 5px;
              transition: background-color 0.15s ease;
            }

            .SidebarItem__icon-wrapper:hover { background: var(--backgroundTertiary); }
            .SidebarItem__icon-wrapper:active { cursor: grabbing; transform: scale(0.95); }

            .SidebarItem__content-icon {
              transition: all 0.15s ease;
              color: var(--textSecondary);
            }

            .SidebarItem--state-active .SidebarItem__content-icon { color: var(--primary); }
            .Item:hover .SidebarItem__content-icon { color: var(--text); transform: scale(1.05); }

            .SidebarItem__drag-handle {
              position: absolute;
              inset: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              color: var(--textTertiary);
              opacity: 0;
              transition: all 0.2s ease;
              background: var(--backgroundGhost);
              backdrop-filter: blur(8px);
              border-radius: 5px;
              border: 1px solid color-mix(in srgb, var(--border) 50%, transparent);
            }

            .SidebarItem:hover .SidebarItem__drag-handle,
            .SidebarItem--state-menu-open .SidebarItem__drag-handle { opacity: 0.9; }
            
            .SidebarItem__selection-checkbox-wrapper {
              display: flex;
              align-items: center;
              color: var(--textSecondary);
              width: 20px;
              height: 20px;
              justify-content: center;
              flex-shrink: 0;
              border-radius: 5px;
              transition: background-color 0.15s ease;
            }

            .SidebarItem__selection-checkbox-wrapper:hover { background: var(--backgroundTertiary); }
            .SidebarItem__selection-checkbox--checked { color: var(--primary); }

            .SidebarItem__content-link {
              flex: 1;
              min-width: 0;
              font-weight: inherit;
              text-decoration: none;
              color: inherit;
              display: block;
            }

            .SidebarItem__content-title {
              display: block;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
              letter-spacing: 0.005em; /* 轻微字距提升可读性 */
            }

            .SidebarItem--state-active .SidebarItem__content-title {
              font-weight: 600; /* 让标题本身也更醒目 */
            }

            .SidebarItem__actions {
              position: absolute;
              right: var(--space-1);
              top: 50%;
              transform: translateY(-50%);
              display: flex;
              align-items: center;
              gap: 1px;
              opacity: 0;
              pointer-events: none;
              transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
              background: var(--backgroundGhost);
              backdrop-filter: blur(10px);
              border: 1px solid color-mix(in srgb, var(--border) 40%, transparent);
              border-radius: 7px;
              overflow: hidden;
              box-shadow: 0 2px 6px var(--shadowLight);
            }

            .SidebarItem:hover .SidebarItem__actions,
            .SidebarItem--state-menu-open .SidebarItem__actions {
              opacity: 1;
              pointer-events: auto;
            }

            .SidebarItem--state-dragging .SidebarItem__actions {
              opacity: 0 !important;
              pointer-events: none !important;
            }
            
            .SidebarItem__context-menu {
              background: var(--background);
              border-radius: 10px;
              padding: var(--space-2);
              min-width: 180px;
              border: 1px solid var(--border);
              box-shadow: 
                0 10px 25px color-mix(in srgb, var(--shadowHeavy) 70%, transparent),
                0 4px 10px var(--shadowMedium);
              backdrop-filter: blur(12px);
            }
            
            .SidebarItem__action-button {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 26px;
              height: 26px;
              padding: 0;
              color: var(--textSecondary);
              background: none;
              border: none;
              cursor: pointer;
              border-radius: 5px;
              transition: all 0.15s ease;
            }

            .SidebarItem__action-button:hover {
              background-color: var(--backgroundTertiary);
              color: var(--text);
              transform: scale(1.05);
            }

            .SidebarItem__action-button:active { transform: scale(0.95); }

            .SidebarItem__menu-item {
              display: flex;
              align-items: center;
              width: 100%;
              padding: var(--space-2) var(--space-3);
              color: var(--text);
              background: none;
              border: none;
              cursor: pointer;
              border-radius: 7px;
              text-align: left;
              transition: all 0.15s ease;
              margin-bottom: 1px;
            }

            .SidebarItem__menu-item:hover { 
              background-color: var(--backgroundHover);
              transform: translateX(2px);
            }

            .SidebarItem__menu-item-icon { 
              margin-right: var(--space-2); 
              color: var(--textSecondary);
              transition: color 0.15s ease;
            }

            .SidebarItem__menu-item:hover .SidebarItem__menu-item-icon { color: var(--text); }
            
            .SidebarItem__submenu-indicator { 
              margin-left: auto; 
              color: var(--textTertiary);
              transition: all 0.15s ease;
            }

            .SidebarItem__menu-item:hover .SidebarItem__submenu-indicator {
              color: var(--textSecondary);
              transform: translateX(2px);
            }

            .SidebarItem--state-selected {
              background: var(--primaryGhost);
              border-color: color-mix(in srgb, var(--primary) 25%, transparent);
              transform: translateX(2px);
              box-shadow: 0 1px 4px color-mix(in srgb, var(--primary) 8%, transparent);
            }

            @media (prefers-reduced-motion: reduce) {
              .SidebarItem,
              .SidebarItem__icon-wrapper,
              .SidebarItem__drag-handle,
              .SidebarItem__actions,
              .SidebarItem__menu-item {
                transition: none !important;
                transform: none !important;
              }
            }
          `}
        </style>
      </>
    );
  }
);

export default React.memo(SidebarItem);
