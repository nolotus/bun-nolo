// src/components/SidebarItem.tsx

import React, { useState, useRef, useCallback, memo, forwardRef } from "react";
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
  SquareIcon,
  CheckboxIcon,
  ChevronRightIcon as SubMenuIcon,
} from "@primer/octicons-react";
import { FaFileLines } from "react-icons/fa6";
import {
  useFloating,
  useClick,
  useDismiss,
  useHover,
  useInteractions,
  FloatingPortal,
  offset,
  flip,
  shift,
  autoUpdate,
} from "@floating-ui/react";
import DeleteContentButton from "./components/DeleteContentButton";
import { selectTheme } from "app/settings/settingSlice";
import {
  selectCurrentSpaceId,
  updateContentTitle,
  selectAllMemberSpaces,
  moveContentToSpace,
} from "create/space/spaceSlice";
import { addPendingFile } from "chat/dialog/dialogSlice";
import { nanoid } from "nanoid";
import { useTranslation } from "react-i18next";
import { useInlineEdit } from "render/web/ui/useInlineEdit";
import InlineEditInput from "render/web/ui/InlineEditInput";
import { Tooltip } from "render/web/ui/Tooltip";
import toast from "react-hot-toast";

// --- 合并进来的子菜单组件 ---
interface MoveToSpaceSubMenuProps {
  contentKey: string;
  onClose: () => void;
  getFloatingProps: (
    props?: React.HTMLProps<HTMLElement> | undefined
  ) => Record<string, unknown>;
}

const MoveToSpaceSubMenu: React.FC<MoveToSpaceSubMenuProps> = ({
  contentKey,
  onClose,
  getFloatingProps,
}) => {
  const theme = useSelector(selectTheme);
  const dispatch = useDispatch();
  const memberSpaces = useSelector(selectAllMemberSpaces);
  const currentSpaceId = useSelector(selectCurrentSpaceId);
  const [isMoving, setIsMoving] = useState<string | null>(null);

  const handleSpaceSelect = useCallback(
    (targetSpaceId: string) => async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      console.log("开始移动内容:", {
        contentKey,
        currentSpaceId,
        targetSpaceId,
      });

      if (!currentSpaceId) {
        toast.error("当前空间ID未定义，无法移动。");
        return;
      }

      if (currentSpaceId === targetSpaceId) {
        toast("目标空间与当前空间相同。");
        onClose();
        return;
      }

      setIsMoving(targetSpaceId);

      try {
        const result = await dispatch(
          moveContentToSpace({
            contentKey,
            sourceSpaceId: currentSpaceId,
            targetSpaceId,
            targetCategoryId: undefined,
          })
        ).unwrap();

        console.log("移动结果:", result);
        toast.success("内容已成功移动");

        // 延迟关闭菜单，让用户看到成功反馈
        setTimeout(onClose, 500);
      } catch (error) {
        console.error("内容移动失败:", error);
        toast.error(
          `内容移动失败: ${error instanceof Error ? error.message : "未知错误"}`
        );
      } finally {
        setIsMoving(null);
      }
    },
    [contentKey, currentSpaceId, dispatch, onClose]
  );

  const availableSpaces = memberSpaces.filter(
    (space) => space.spaceId !== currentSpaceId
  );

  return (
    <div
      className="SidebarItem__subMenu"
      role="menu"
      {...getFloatingProps({
        onClick: (e: React.MouseEvent) => e.stopPropagation(),
      })}
    >
      {availableSpaces.length > 0 ? (
        availableSpaces.map((space) => (
          <button
            key={space.spaceId}
            className={`SidebarItem__menuItem ${
              isMoving === space.spaceId ? "SidebarItem__menuItem--loading" : ""
            }`}
            onClick={handleSpaceSelect(space.spaceId)}
            disabled={isMoving === space.spaceId}
            role="menuitem"
          >
            {isMoving === space.spaceId && (
              <span className="SidebarItem__loadingSpinner" />
            )}
            <span>{space.spaceName || space.spaceId}</span>
          </button>
        ))
      ) : (
        <div className="SidebarItem__subMenuEmpty">无其他可用空间</div>
      )}
    </div>
  );
};
MoveToSpaceSubMenu.displayName = "MoveToSpaceSubMenu";

// --- 辅助组件 ActionButton ---
const ActionButton = forwardRef<
  HTMLButtonElement,
  {
    onClick?: (e: React.MouseEvent) => void;
    icon: React.ElementType;
    label: string;
    className?: string;
  }
>(({ onClick, icon: Icon, label, className = "" }, ref) => (
  <button
    ref={ref}
    className={`SidebarItem__actionButton ${className}`}
    onClick={onClick}
    aria-label={label}
    type="button"
  >
    <Icon size={16} />
  </button>
));
ActionButton.displayName = "ActionButton";

// --- 辅助组件 MenuItem ---
const MenuItem = forwardRef<
  HTMLButtonElement,
  {
    onClick: (e: React.MouseEvent) => void;
    icon?: React.ElementType;
    label: string;
    className?: string;
    isSubMenuTrigger?: boolean;
  }
>(
  (
    { onClick, icon: Icon, label, className = "", isSubMenuTrigger = false },
    ref
  ) => (
    <button
      ref={ref}
      className={`SidebarItem__menuItem ${className}`}
      onClick={onClick}
      role="menuitem"
      aria-label={label}
      type="button"
    >
      {Icon && <Icon size={14} style={{ marginRight: "8px" }} />}
      <span style={{ flex: 1, textAlign: "left" }}>{label}</span>
      {isSubMenuTrigger && <SubMenuIcon size={14} style={{ opacity: 0.6 }} />}
    </button>
  )
);
MenuItem.displayName = "MenuItem";

// --- 辅助组件 ItemDraggable ---
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
    const handleDragEnd = (e: React.DragEvent) => {};
    return children({ onDragStart: handleDragStart, onDragEnd: handleDragEnd });
  }
);
ItemDraggable.displayName = "ItemDraggable";

// --- 主组件 SidebarItem ---
interface SidebarItemProps {
  contentKey: string;
  type: "dialog" | "page" | "image" | "doc" | "code" | "file";
  title: string;
  categoryId?: string;
  animate?: boolean;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelectItem?: (contentKey: string) => void;
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
  ({
    contentKey,
    type,
    title,
    categoryId,
    animate = false,
    isSelectionMode = false,
    isSelected = false,
    onSelectItem,
  }) => {
    const { pageKey: pageKeyFromPath } = useParams<{ pageKey?: string }>();
    const theme = useSelector(selectTheme);
    const currentSpaceId = useSelector(selectCurrentSpaceId);
    const dispatch = useDispatch();
    const { t } = useTranslation("chat");

    const [isIconHover, setIsIconHover] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isMoveSubMenuOpen, setIsMoveSubMenuOpen] = useState(false);

    const linkRef = useRef<HTMLAnchorElement>(null);

    const {
      x,
      y,
      refs,
      floatingStyles,
      context: menuContext,
      placement,
    } = useFloating({
      open: menuOpen,
      onOpenChange: setMenuOpen,
      placement: "right-start",
      middleware: [offset(4), flip(), shift({ padding: 8 })],
      whileElementsMounted: autoUpdate,
    });

    const { getReferenceProps, getFloatingProps } = useInteractions([
      useClick(menuContext),
      useDismiss(menuContext, {
        outsidePress: (event) =>
          // 只在既不在根菜单也不在子菜单时才关闭
          !refs.floating.current?.contains(event.target as Node) &&
          !subMenuRefs.floating.current?.contains(event.target as Node),
      }),
    ]);

    const {
      refs: subMenuRefs,
      floatingStyles: subMenuFloatingStyles,
      context: subMenuContext,
    } = useFloating({
      open: isMoveSubMenuOpen,
      onOpenChange: setIsMoveSubMenuOpen,
      placement: "right-start",
      middleware: [offset(4), flip(), shift({ padding: 8 })],
      whileElementsMounted: autoUpdate,
    });

    const {
      getReferenceProps: getSubMenuReferenceProps,
      getFloatingProps: getSubMenuFloatingProps,
    } = useInteractions([
      useHover(subMenuContext, { delay: { open: 100, close: 200 } }),
      useDismiss(subMenuContext),
    ]);

    const IconComponent = ITEM_ICONS[type] || FileIcon;
    const displayTitle = title || contentKey;
    const isActive = pageKeyFromPath === contentKey;
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
    const showActions = isHovered || menuOpen || isMoveSubMenuOpen;

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

    const handleContainerClick = (e: React.MouseEvent) => {
      if (isSelectionMode) {
        e.preventDefault();
        onSelectItem?.(contentKey);
      }
    };

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
          if (isSelectionMode) {
            onSelectItem?.(contentKey);
          } else {
            linkRef.current?.click();
          }
        } else if (e.key === "F2") {
          e.preventDefault();
          if (!isSelectionMode) startEditing();
        }
      },
      [isEditing, startEditing, isSelectionMode, onSelectItem, contentKey]
    );

    const handleCloseAllMenus = useCallback(() => {
      setIsMoveSubMenuOpen(false);
      setMenuOpen(false);
    }, []);

    const handleMenu = {
      edit: useCallback(
        (e: React.MouseEvent) => {
          e.stopPropagation();
          setMenuOpen(false);
          startEditing();
        },
        [startEditing]
      ),
    };

    const moreActionsButton = (
      <ActionButton
        {...getReferenceProps({ onClick: (e) => e.stopPropagation() })}
        icon={KebabHorizontalIcon}
        label="更多操作"
      />
    );

    const isPlacedRight = placement.startsWith("right");
    const menuStyle = {
      ...floatingStyles,
      ...(isPlacedRight && {
        borderLeft: "none",
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        boxShadow: "4px 0px 18px rgba(0, 0, 0, 0.12)",
      }),
    };

    return (
      <>
        <div
          ref={refs.setReference}
          className={[
            "SidebarItem",
            isActive && "SidebarItem--active",
            isEditing && "SidebarItem--editing",
            isSelectionMode && "SidebarItem--selection-mode",
            isSelected && "SidebarItem--selected",
          ]
            .filter(Boolean)
            .join(" ")}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleContainerClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          aria-selected={isActive || isSelected}
        >
          {isSelectionMode ? (
            <div className="SidebarItem__checkbox-wrapper">
              {isSelected ? (
                <CheckboxIcon
                  size={ICON_SIZE}
                  className="SidebarItem__checkbox SidebarItem__checkbox--checked"
                />
              ) : (
                <SquareIcon
                  size={ICON_SIZE}
                  className="SidebarItem__checkbox"
                />
              )}
            </div>
          ) : (
            <ItemDraggable
              id={contentKey}
              containerId={categoryId || "default"}
            >
              {({ onDragStart, onDragEnd }) => (
                <span
                  className={`SidebarItem__icon ${isIconHover ? "SidebarItem__icon--draggable" : ""}`}
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
          )}

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
              onClick={(e) =>
                (isEditing || isSelectionMode) && e.preventDefault()
              }
            >
              <span
                className="SidebarItem__linkText"
                title={isSelectionMode ? "点击选择" : displayTitle}
              >
                {displayTitle}
              </span>
            </NavLink>
          )}

          {showActions && !isEditing && !isSelectionMode && (
            <div className="SidebarItem__actionButtons">
              {isMobile ? (
                moreActionsButton
              ) : (
                <Tooltip content="更多操作" delay={100}>
                  {moreActionsButton}
                </Tooltip>
              )}
              {contentKey.startsWith("page") && (
                <Tooltip content="加入对话" delay={100}>
                  <ActionButton
                    onClick={handleAddToConversation}
                    icon={ChevronRightIcon}
                    label="加入对话"
                  />
                </Tooltip>
              )}
            </div>
          )}
        </div>

        {menuOpen && (
          <FloatingPortal>
            <div
              ref={refs.setFloating}
              style={menuStyle}
              {...getFloatingProps()}
            >
              <div
                className="SidebarItem__menu"
                style={{ border: "none", boxShadow: "none", animation: "none" }}
              >
                <MenuItem
                  onClick={handleMenu.edit}
                  icon={PencilIcon}
                  label="编辑标题"
                />
                <MenuItem
                  ref={subMenuRefs.setReference}
                  {...getSubMenuReferenceProps()}
                  onClick={(e) => e.stopPropagation()}
                  label="移动到空间"
                  isSubMenuTrigger
                />
                <DeleteContentButton
                  contentKey={contentKey}
                  title={displayTitle}
                  theme={theme}
                  className="SidebarItem__menuItem SidebarItem__deleteMenuItem"
                />
              </div>
            </div>
            {isMoveSubMenuOpen && (
              <div ref={subMenuRefs.setFloating} style={subMenuFloatingStyles}>
                <MoveToSpaceSubMenu
                  contentKey={contentKey}
                  onClose={handleCloseAllMenus}
                  getFloatingProps={getSubMenuFloatingProps}
                />
              </div>
            )}
          </FloatingPortal>
        )}

        <style href="SidebarItem" precedence="medium">{`
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
            border: 1px solid transparent;
          }
          .SidebarItem:hover {
            background-color: ${theme.backgroundHover};
            color: ${theme.text};
            transform: translateX(2px);
          }
          .SidebarItem:focus-visible {
            box-shadow: 0 0 0 2px ${theme.primary}40;
          }
          .SidebarItem--active {
            background: linear-gradient(
              90deg,
              ${theme.primaryGhost || "rgba(22, 119, 255, 0.08)"} 0%,
              ${theme.primaryGhost || "rgba(22, 119, 255, 0.04)"} 100%
            );
            color: ${theme.primary};
            transform: translateX(4px);
          }
          .SidebarItem--active::before {
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
            transition: all 0.12s ease;
            flex-shrink: 0;
            cursor: pointer;
          }
          .SidebarItem:hover .SidebarItem__icon {
            color: ${theme.textSecondary};
            transform: scale(1.1);
          }
          .SidebarItem--active .SidebarItem__icon {
            color: ${theme.primary};
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
            padding: 2px 4px;
            border-radius: 4px;
            transition: background-color 0.15s ease;
            cursor: pointer;
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
            border-radius: 8px;
            padding: 4px;
            z-index: 1000;
            min-width: 150px;
            animation: menuFadeIn 0.15s ease;
            border: 1px solid ${theme.border};
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          .SidebarItem__subMenu {
            background: ${theme.backgroundElevated || theme.background};
            border-radius: 8px;
            padding: 4px;
            z-index: 1001;
            min-width: 150px;
            animation: menuFadeIn 0.15s ease;
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
            border: 1px solid ${theme.border};
          }
          .SidebarItem__subMenuEmpty {
            padding: 8px 12px;
            font-size: 13px;
            color: ${theme.textSecondary};
            text-align: center;
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
            position: relative;
          }
          .SidebarItem__menuItem:hover {
            background-color: ${theme.backgroundHover};
            transform: translateX(2px);
          }
          .SidebarItem__menuItem--disabled {
            color: ${theme.textTertiary};
            cursor: not-allowed;
          }
          .SidebarItem__menuItem--disabled:hover {
            background-color: transparent;
            transform: none;
          }
          .SidebarItem__menuItem--loading {
            opacity: 0.7;
            cursor: wait;
          }
          .SidebarItem__loadingSpinner {
            display: inline-block;
            width: 12px;
            height: 12px;
            border: 2px solid ${theme.textTertiary};
            border-top: 2px solid ${theme.primary};
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 8px;
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

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </>
    );
  }
);

SidebarItem.displayName = "SidebarItem";
export default SidebarItem;
