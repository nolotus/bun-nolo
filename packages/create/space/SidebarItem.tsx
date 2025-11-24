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

const ICON_SIZE = 16 as const;

const ITEM_ICONS = {
  dialog: LuMessageSquare,
  page: LuFileText,
  image: LuImage,
  doc: LuBook,
  code: LuFileCode,
  file: LuFile,
} as const;

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

function IconButton({
  onClick,
  icon: Icon,
  label,
}: {
  onClick?: (e: React.MouseEvent) => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      className="SidebarItem__action-button"
      onClick={onClick}
      aria-label={label}
      type="button"
    >
      <Icon size={ICON_SIZE} />
    </button>
  );
}

function MenuItem({
  onClick,
  icon: Icon,
  label,
  isSubMenu = false,
}: {
  onClick: (e: React.MouseEvent) => void;
  icon: React.ElementType;
  label: string;
  isSubMenu?: boolean;
}) {
  return (
    <button
      className="SidebarItem__menu-item"
      onClick={onClick}
      role="menuitem"
      type="button"
    >
      <Icon size={ICON_SIZE} className="SidebarItem__menu-item-icon" />
      <span>{label}</span>
      {isSubMenu && (
        <LuChevronRight
          size={ICON_SIZE}
          className="SidebarItem__submenu-indicator"
        />
      )}
    </button>
  );
}

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
        if (!open) onToggleMenu(null);
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
      if (!isMenuOpen) setMovePanelOpen(false);
    }, [isMenuOpen]);

    const { getReferenceProps, getFloatingProps } = useInteractions([
      useClick(context),
      useDismiss(context),
    ]);

    const { isEditing, startEditing, inputRef, inputProps } = useInlineEdit({
      initialValue: title,
      onSave: (newTitle) => {
        const v = newTitle.trim();
        if (currentSpaceId && v) {
          dispatch(
            updateContentTitle({
              spaceId: currentSpaceId,
              contentKey,
              title: v,
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
          if (isSelectionMode && onSelectItem) onSelectItem(contentKey);
          else linkRef.current?.click();
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

    const Icon = ITEM_ICONS[type] ?? LuFile;
    const isActive = activePageKey === contentKey;
    const displayTitle = title || contentKey;

    return (
      <>
        <div
          ref={outerRef}
          className="SidebarItem"
          data-active={isActive || undefined}
          data-editing={isEditing || undefined}
          data-selection={isSelectionMode || undefined}
          data-selected={isSelected || undefined}
          data-dragging={isDragging || undefined}
          data-open={isMenuOrPanelOpen || undefined}
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
                  className="SidebarItem__selection-checkbox"
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
              <Icon size={ICON_SIZE} className="SidebarItem__content-icon" />
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
                  <IconButton
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
                  <IconButton icon={LuEllipsis} label={t("moreActions")} />
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
                  <MenuItem
                    onClick={() => {
                      startEditing();
                      onToggleMenu(null);
                    }}
                    icon={LuPencil}
                    label={t("editTitle")}
                  />
                  <MenuItem
                    onClick={() => setMovePanelOpen(true)}
                    icon={LuFolderSymlink}
                    label={t("moveToSpace")}
                    isSubMenu
                  />
                  <DeleteContentButton
                    contentKey={contentKey}
                    title={displayTitle}
                    as={MenuItem}
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
              display: grid;
              grid-template-columns: auto 1fr auto;
              align-items: center;
              column-gap: var(--space-2);
              padding: var(--space-1) var(--space-2);
              border-radius: 8px;
              color: var(--text);
              min-height: 36px;
              border: 1px solid transparent;
              cursor: pointer;
              font-size: 0.875rem;
              transition: background-color .2s, transform .2s, box-shadow .2s, opacity .2s;
              outline: none;
            }
            .SidebarItem:focus-visible {
              outline: 2px solid var(--primary);
              outline-offset: 2px;
            }
            .SidebarItem:hover,
            .SidebarItem[data-open] {
              background: var(--backgroundHover);
              box-shadow: 0 1px 3px var(--shadowLight);
              transform: translateX(3px);
            }
            .SidebarItem[data-active] {
              background: var(--primaryGhost);
              color: var(--primary);
              border-color: color-mix(in srgb, var(--primary) 20%, transparent);
              font-weight: 600;
              box-shadow: 0 2px 6px color-mix(in srgb, var(--primary) 12%, transparent);
              transform: translateX(4px);
            }
            .SidebarItem[data-active]::before {
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
            .SidebarItem[data-dragging] {
              opacity: .4;
              transform: scale(.96);
              box-shadow: 0 6px 20px var(--shadowMedium);
            }

            .SidebarItem__icon-wrapper {
              position: relative;
              display: grid;
              place-items: center;
              width: 20px;
              height: 20px;
              flex-shrink: 0;
              border-radius: 5px;
              cursor: grab;
              transition: background-color .15s ease, transform .15s ease;
            }
            .SidebarItem__icon-wrapper:hover { background: var(--backgroundTertiary); }
            .SidebarItem__icon-wrapper:active { cursor: grabbing; transform: scale(.95); }

            .SidebarItem__content-icon {
              color: var(--textSecondary);
              transition: color .15s ease, transform .15s ease;
            }
            .SidebarItem[data-active] .SidebarItem__content-icon { color: var(--primary); }
            .SidebarItem:hover .SidebarItem__content-icon {
              color: var(--text);
              transform: scale(1.05);
            }

            .SidebarItem__drag-handle {
              position: absolute;
              inset: 0;
              display: grid;
              place-items: center;
              color: var(--textTertiary);
              opacity: 0;
              transition: opacity .2s ease;
              background: var(--backgroundGhost);
              backdrop-filter: blur(8px);
              border-radius: 5px;
              border: 1px solid color-mix(in srgb, var(--border) 50%, transparent);
            }
            .SidebarItem:hover .SidebarItem__drag-handle,
            .SidebarItem[data-open] .SidebarItem__drag-handle {
              opacity: .9;
            }

            .SidebarItem__selection-checkbox-wrapper {
              display: grid;
              place-items: center;
              width: 20px;
              height: 20px;
              color: var(--textSecondary);
              flex-shrink: 0;
              border-radius: 5px;
              transition: background-color .15s ease;
            }
            .SidebarItem__selection-checkbox-wrapper:hover {
              background: var(--backgroundTertiary);
            }
            .SidebarItem__selection-checkbox {
              color: var(--primary);
            }

            .SidebarItem__content-link {
              min-width: 0;
              text-decoration: none;
              color: inherit;
              display: block;
            }
            .SidebarItem__content-title {
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
              letter-spacing: .005em;
            }
            .SidebarItem[data-active] .SidebarItem__content-title {
              font-weight: 600;
            }

            .SidebarItem__actions {
              position: static;
              transform: none;
              justify-self: end;
              display: grid;
              grid-auto-flow: column;
              align-items: center;
              column-gap: 1px;

              opacity: 0;
              pointer-events: none;
              transition: opacity .2s, transform .2s;
              background: var(--backgroundGhost);
              backdrop-filter: blur(10px);
              border: 1px solid color-mix(in srgb, var(--border) 40%, transparent);
              border-radius: 7px;
              overflow: hidden;
              box-shadow: 0 2px 6px var(--shadowLight);
            }
            .SidebarItem:hover .SidebarItem__actions,
            .SidebarItem[data-open] .SidebarItem__actions {
              opacity: 1;
              pointer-events: auto;
            }
            .SidebarItem[data-dragging] .SidebarItem__actions {
              opacity: 0 !important;
              pointer-events: none !important;
            }

            .SidebarItem__action-button {
              display: grid;
              place-items: center;
              width: 26px;
              height: 26px;
              color: var(--textSecondary);
              background: none;
              border: none;
              cursor: pointer;
              border-radius: 5px;
              transition: background-color .15s ease, color .15s ease, transform .15s ease;
            }
            .SidebarItem__action-button:hover {
              background: var(--backgroundTertiary);
              color: var(--text);
              transform: scale(1.05);
            }
            .SidebarItem__action-button:active {
              transform: scale(.95);
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
            .SidebarItem__menu-item {
              display: grid;
              grid-template-columns: auto 1fr auto;
              align-items: center;
              width: 100%;
              padding: var(--space-2) var(--space-3);
              color: var(--text);
              background: none;
              border: none;
              cursor: pointer;
              border-radius: 7px;
              text-align: left;
              transition: background-color .15s ease, transform .15s ease;
              margin-bottom: 1px;
            }
            .SidebarItem__menu-item:hover {
              background: var(--backgroundHover);
              transform: translateX(2px);
            }
            .SidebarItem__menu-item-icon {
              margin-right: var(--space-2);
              color: var(--textSecondary);
              transition: color .15s ease;
            }
            .SidebarItem__menu-item:hover .SidebarItem__menu-item-icon {
              color: var(--text);
            }
            .SidebarItem__submenu-indicator {
              margin-left: auto;
              color: var(--textTertiary);
              transition: transform .15s ease, color .15s ease;
            }
            .SidebarItem__menu-item:hover .SidebarItem__submenu-indicator {
              color: var(--textSecondary);
              transform: translateX(2px);
            }

            .SidebarItem[data-selected] {
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
