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
  DiscussionOutdatedIcon,
  FileIcon,
  ImageIcon,
  BookIcon,
  FileCodeIcon,
  GrabberIcon,
  KebabHorizontalIcon,
  PencilIcon,
  SquareIcon,
  CheckboxIcon,
  ChevronRightIcon,
  PlusIcon,
} from "@primer/octicons-react";
import { FaFileLines } from "react-icons/fa6";
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
  selectCurrentSpaceId,
  updateContentTitle,
  selectAllMemberSpaces,
  moveContentToSpace,
} from "create/space/spaceSlice";
import { addPendingFile } from "chat/dialog/dialogSlice";
import { useInlineEdit } from "render/web/ui/useInlineEdit";
import InlineEditInput from "render/web/ui/InlineEditInput";
import { Tooltip } from "render/web/ui/Tooltip";
import DeleteContentButton from "./components/DeleteContentButton";

// Constants
const ICON_SIZE = 16;

// Types
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
  // --- 变更点 1: 新增 Props ---
  isMenuOpen: boolean;
  onToggleMenu: (key: string | null) => void;
};

// Helper Components
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
  >
    <Icon size={16} className="SidebarItem__menu-item-icon" />
    <span>{label}</span>
    {isSubMenu && (
      <ChevronRightIcon size={16} className="SidebarItem__submenu-indicator" />
    )}
  </button>
));

// Icons mapping
const ITEM_ICONS = {
  dialog: DiscussionOutdatedIcon,
  page: FaFileLines,
  image: ImageIcon,
  doc: BookIcon,
  code: FileCodeIcon,
  file: FileIcon,
} as const;

// MoveToPanel Component
const SidebarMoveToPanel: React.FC<{
  contentKey: string;
  onClose: () => void;
}> = ({ contentKey, onClose }) => {
  const { t } = useTranslation("space");
  const dispatch = useAppDispatch();
  const memberSpaces = useAppSelector(selectAllMemberSpaces);
  const currentSpaceId = useAppSelector(selectCurrentSpaceId);
  const [movingSpaceId, setMovingSpaceId] = useState<string | null>(null);

  const handleSpaceSelect = useCallback(
    async (targetSpaceId: string) => {
      if (!currentSpaceId || currentSpaceId === targetSpaceId) return;

      setMovingSpaceId(targetSpaceId);
      try {
        await dispatch(
          moveContentToSpace({
            contentKey,
            sourceSpaceId: currentSpaceId,
            targetSpaceId,
            targetCategoryId: undefined,
          })
        ).unwrap();
        toast.success(t("contentMoved"));
        onClose();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : t("unknownError");
        toast.error(t("moveFailed", { message }));
      } finally {
        setMovingSpaceId(null);
      }
    },
    [contentKey, currentSpaceId, dispatch, onClose, t]
  );

  const availableSpaces = memberSpaces.filter(
    (space) => space.spaceId !== currentSpaceId
  );

  return (
    <div className="SidebarItem__move-panel" role="menu">
      {availableSpaces.length > 0 ? (
        availableSpaces.map((space) => (
          <button
            key={space.spaceId}
            className={`SidebarItem__move-panel-item ${
              movingSpaceId === space.spaceId
                ? "SidebarItem__move-panel-item--loading"
                : ""
            }`}
            onClick={() => handleSpaceSelect(space.spaceId)}
            disabled={!!movingSpaceId}
            role="menuitem"
          >
            {movingSpaceId === space.spaceId && (
              <span className="SidebarItem__loading-spinner" />
            )}
            <span>{space.spaceName || space.spaceId}</span>
          </button>
        ))
      ) : (
        <div className="SidebarItem__move-panel-empty">
          {t("noOtherSpaces")}
        </div>
      )}
    </div>
  );
};

// Main Component
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
      // --- 变更点 1: 接收 Props ---
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
    // menuOpen state is removed, movePanelOpen is kept local
    const [movePanelOpen, setMovePanelOpen] = useState(false);

    const linkRef = useRef<HTMLAnchorElement>(null);
    const isMenuOrPanelOpen = isMenuOpen || movePanelOpen;

    // --- 变更点 2: 更新 Floating UI 配置 ---
    const { refs, floatingStyles, context } = useFloating({
      open: isMenuOrPanelOpen,
      onOpenChange: (open) => {
        // Let the parent know the menu should close (e.g., on dismiss)
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

    // --- 变更点 3: 添加 Effect 以同步状态 ---
    // When the parent closes the menu, ensure the sub-panel also closes.
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
      onToggleMenu(null); // Close menu on drag start
      e.dataTransfer.setData("itemId", contentKey);
      e.dataTransfer.setData("sourceContainer", categoryId || "default");
      e.dataTransfer.setData("dragType", "item");
      e.dataTransfer.effectAllowed = "move";
    };

    const handleDragEnd = () => setIsDragging(false);

    const IconComponent = ITEM_ICONS[type] || FileIcon;
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
                <CheckboxIcon
                  size={ICON_SIZE}
                  className="SidebarItem__selection-checkbox SidebarItem__selection-checkbox--checked"
                />
              ) : (
                <SquareIcon
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
                <GrabberIcon size={14} />
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
                    icon={PlusIcon}
                    label={t("joinConversation")}
                  />
                </Tooltip>
              )}

              <div
                ref={refs.setReference}
                // --- 变更点 4: 更新事件处理 ---
                {...getReferenceProps({
                  onClick: (e) => {
                    e.stopPropagation();
                    onToggleMenu(contentKey);
                  },
                })}
              >
                <Tooltip content={t("moreActions")}>
                  <SidebarActionButton
                    icon={KebabHorizontalIcon}
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
                      onToggleMenu(null); // Close menu after action
                    }}
                    icon={PencilIcon}
                    label={t("editTitle")}
                  />
                  <SidebarMenuItem
                    onClick={() => setMovePanelOpen(true)}
                    icon={ChevronRightIcon}
                    label={t("moveToSpace")}
                    isSubMenu
                  />
                  <DeleteContentButton
                    contentKey={contentKey}
                    title={displayTitle}
                    as={SidebarMenuItem}
                    onDelete={() => onToggleMenu(null)} // Close menu after action
                  />
                </div>
              )}
              {movePanelOpen && (
                <SidebarMoveToPanel
                  contentKey={contentKey}
                  onClose={() => {
                    setMovePanelOpen(false);
                    onToggleMenu(null); // Close menu after action
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
              border-radius: 6px;
              transition: all 0.15s cubic-bezier(0.25, 0.8, 0.25, 1);
              color: var(--text);
              min-height: 36px;
              outline: none;
              border: 1px solid transparent;
              cursor: pointer;
              font-size: 0.875rem;
            }

            .SidebarItem--state-dragging { 
              opacity: 0.5; 
              transform: scale(0.98); 
            }

            .SidebarItem:hover,
            .SidebarItem:focus-visible,
            .SidebarItem--state-menu-open {
              background-color: var(--backgroundHover);
              transform: translateX(2px);
            }

            .SidebarItem:focus-visible {
              outline: 2px solid var(--primary);
              outline-offset: -1px;
            }

            .SidebarItem--state-active {
              background: var(--primaryGhost);
              color: var(--primary);
              border-color: color-mix(in srgb, var(--primary) 25%, transparent);
              font-weight: 500;
              transform: translateX(4px);
            }

            .SidebarItem--state-active::before {
              content: "";
              position: absolute;
              left: -2px;
              top: 50%;
              transform: translateY(-50%);
              width: 3px;
              height: 20px;
              background: var(--primary);
              border-radius: 0 2px 2px 0;
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
            }

            .SidebarItem__icon-wrapper:active { cursor: grabbing; }

            .SidebarItem__content-icon {
              transition: color 0.15s ease;
              color: var(--textSecondary);
            }

            .SidebarItem--state-active .SidebarItem__content-icon { 
              color: var(--primary); 
            }

            .SidebarItem:hover .SidebarItem__content-icon {
              color: var(--text);
            }

            .SidebarItem__drag-handle {
              position: absolute;
              inset: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              color: var(--textTertiary);
              opacity: 0;
              transition: opacity 0.2s ease;
              background: var(--backgroundGhost);
              backdrop-filter: blur(6px);
              border-radius: 4px;
              border: 1px solid var(--borderLight);
            }

            .SidebarItem:hover .SidebarItem__drag-handle,
            .SidebarItem--state-menu-open .SidebarItem__drag-handle {
              opacity: 1;
            }

            .SidebarItem__selection-checkbox-wrapper {
              display: flex;
              align-items: center;
              color: var(--textSecondary);
              width: 20px;
              height: 20px;
              justify-content: center;
              flex-shrink: 0;
            }

            .SidebarItem__selection-checkbox--checked { 
              color: var(--primary); 
            }

            .SidebarItem__content-link {
              flex: 1;
              min-width: 0;
              font-weight: inherit;
              text-decoration: none;
              color: inherit;
              display: block;
            }

            .SidebarItem--state-active .SidebarItem__content-link {
              font-weight: 500;
            }

            .SidebarItem__content-title {
              display: block;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
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
              transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
              background: var(--backgroundGhost);
              backdrop-filter: blur(8px);
              border: 1px solid var(--borderLight);
              border-radius: 6px;
              overflow: hidden;
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

            .SidebarItem__context-menu, 
            .SidebarItem__move-panel {
              background: var(--background);
              border-radius: 8px;
              padding: var(--space-1);
              min-width: 180px;
              border: 1px solid var(--border);
              box-shadow: 0 8px 24px var(--shadowMedium), 0 2px 8px var(--shadowLight);
            }

            .SidebarItem__action-button {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 24px;
              height: 24px;
              padding: 0;
              color: var(--textSecondary);
              background: none;
              border: none;
              cursor: pointer;
              transition: all 0.12s ease;
            }

            .SidebarItem__action-button:hover {
              background-color: var(--backgroundTertiary);
              color: var(--text);
            }

            .SidebarItem__menu-item, 
            .SidebarItem__move-panel-item {
              display: flex;
              align-items: center;
              width: 100%;
              padding: var(--space-2) var(--space-3);
              color: var(--text);
              background: none;
              border: none;
              cursor: pointer;
              border-radius: 6px;
              text-align: left;
              transition: background-color 0.12s ease;
            }

            .SidebarItem__menu-item:hover, 
            .SidebarItem__move-panel-item:hover:not(:disabled) {
              background-color: var(--backgroundHover);
            }

            .SidebarItem__menu-item-icon { 
              margin-right: var(--space-2); 
              color: var(--textSecondary); 
            }
            
            .SidebarItem__submenu-indicator { 
              margin-left: auto; 
              color: var(--textTertiary); 
            }

            .SidebarItem__move-panel-item--loading {
              cursor: wait;
              background-color: var(--backgroundHover);
              opacity: 0.7;
            }

            .SidebarItem__loading-spinner {
              width: 12px;
              height: 12px;
              border: 1.5px solid var(--textQuaternary);
              border-top-color: var(--primary);
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin-right: var(--space-2);
            }

            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }

            .SidebarItem__move-panel-empty {
              padding: var(--space-3);
              color: var(--textTertiary);
              text-align: center;
            }

            .SidebarItem--mode-selection { 
              cursor: pointer; 
            }

            .SidebarItem--state-selected {
              background-color: var(--primaryGhost);
              border-color: color-mix(in srgb, var(--primary) 30%, transparent);
              transform: translateX(1px);
            }
          `}
        </style>
      </>
    );
  }
);

// --- 变更点 5: 使用 React.memo 包裹组件 ---
export default React.memo(SidebarItem);
