import {
  FloatingFocusManager,
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
  useTransitionStyles,
} from "@floating-ui/react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { CreateSpaceForm } from "create/space/CreateSpaceForm";
import {
  changeSpace,
  // fetchUserSpaceMemberships, // <- 移除导入，因为 App.tsx 会处理
  selectAllMemberSpaces,
  selectCurrentSpace,
  selectSpaceLoading,
} from "create/space/spaceSlice";
import React, { useEffect, useState } from "react"; // 移除了 useEffect 如果不再使用
import { useTranslation } from "react-i18next";
import { RxDropdownMenu } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { Dialog } from "render/web/ui/Dialog";
import { useModal } from "render/ui/Modal";
import { PlusIcon, ProjectIcon } from "@primer/octicons-react";
import { useTheme } from "app/theme";
import { zIndex } from "../styles/zIndex";
import NavIconItem from "./blocks/NavIconItem";
import { CreateSpaceButton } from "create/space/CreateSpaceButton";
import { selectCurrentUserId } from "auth/authSlice"; // 保持，可能仍然需要
import { createSpaceKey } from "create/space/spaceKeys";
import { SpaceItem } from "create/space/components/SpaceItem";
import { CreateMenu } from "create/CreateMenu";

export const SidebarTop = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  // const currentUserId = useAppSelector(selectCurrentUserId); // 保持，以防未来需要或检查条件
  const spaces = useAppSelector(selectAllMemberSpaces) || []; // 直接从 state 获取，由 App.tsx 填充
  const space = useAppSelector(selectCurrentSpace);
  const loading = useAppSelector(selectSpaceLoading); // 可能需要调整 loading 状态的来源或含义

  // --------------------------------------------------------------------
  // !! 移除了此处的 useEffect !!
  // useEffect(() => {
  //   const fetchSpaces = async () => {
  //     if (currentUserId && !loading && (!spaces || spaces.length === 0)) {
  //       try {
  //         await dispatch(fetchUserSpaceMemberships(currentUserId)).unwrap();
  //       } catch (error) {
  //         console.error("Failed to fetch spaces in SidebarTop:", error);
  //       }
  //     }
  //   };
  //   fetchSpaces();
  // }, [currentUserId, spaces, loading, dispatch]);
  // --------------------------------------------------------------------

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { visible, open: openModal, close: closeModal } = useModal();

  const spacesLength = spaces.length;
  const listRef = React.useRef<Array<HTMLElement | null>>(
    // 初始化大小现在依赖于 selector 的初始值
    new Array(spacesLength + 1).fill(null)
  );

  // 依赖于 spaces.length 的 useEffect 仍然需要，用于更新 listRef 大小
  useEffect(() => {
    listRef.current = Array(spaces.length + 1).fill(null);
    // 如果 spaces 变化时下拉菜单是打开的，重置 activeIndex 可能更安全
    if (isOpen) {
      setActiveIndex(null);
    }
  }, [spaces.length, isOpen]); // 添加 isOpen 依赖

  // --- Floating UI Hooks (保持不变) ---
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "bottom-start",
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(4),
      flip(),
      shift(),
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
          });
        },
      }),
    ],
  });

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    initial: { opacity: 0, transform: "translateY(-4px)" },
    open: { opacity: 1, transform: "translateY(0)" },
    close: { opacity: 0, transform: "translateY(-4px)" },
    duration: { open: 150, close: 100 },
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);
  const listNavigation = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    loop: true,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [click, dismiss, role, listNavigation]
  );
  // --- Floating UI Hooks End ---

  // --- Event Handlers (保持不变) ---
  const handleOptionClick = (spaceId?: string) => {
    if (!spaceId) return;
    // 仍然需要 dispatch changeSpace
    dispatch(changeSpace(spaceId));
    navigate(`/space/${spaceId}`);
    setIsOpen(false);
  };

  const handleSettingsClick = (
    e: React.MouseEvent,
    spaceMemberpath: string // 注意：这里用的是 dbKey/memberPath，需要确认 SpaceItem 传递的是什么
  ) => {
    e.stopPropagation();
    // 假设 spaceMemberpath 就是 dbKey 如 'space-member-userId-spaceId'
    const spaceId = createSpaceKey.spaceIdFromMember(spaceMemberpath); // 确认此函数能正确解析
    if (spaceId) {
      navigate(`/space/${spaceId}/settings`);
      setIsOpen(false);
    } else {
      console.error("Could not extract spaceId from:", spaceMemberpath);
    }
  };

  const isCurrentSpace = (spaceId: string) => space?.id === spaceId;
  // --- Event Handlers End ---

  // --- Render Logic (保持不变) ---
  return (
    <div className="space-sidebar-top" role="navigation">
      <div className="space-dropdown">
        <button
          ref={refs.setReference}
          {...getReferenceProps()}
          className={`space-dropdown__trigger ${isOpen ? "is-open" : ""} ${loading ? "is-loading" : ""}`}
          aria-label={t("select_space")}
          aria-expanded={isOpen}
          // loading 状态现在完全由 Redux state 驱动
          disabled={loading}
        >
          <span className="space-dropdown__name" title={space?.name}>
            {/* loading 状态可能需要更精细的控制，因为它可能代表 spaceSlice 的任何异步操作 */}
            {loading && !space?.name
              ? t("loading")
              : space?.name || t("select_space")}
          </span>
          <RxDropdownMenu size={14} className="space-dropdown__icon" />
        </button>

        {/* Dropdown Menu Content */}
        {isMounted && ( // 移除 !loading 条件，允许在加载时也能看到空的骨架或上一次的数据
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              style={{
                ...floatingStyles,
                ...transitionStyles,
              }}
              {...getFloatingProps()}
              className="space-dropdown__menu"
              role="listbox"
              aria-label={t("space_list")}
            >
              <div className="space-dropdown__content">
                {/* 显示逻辑稍微调整，即使 loading 也可渲染 */}
                {spaces.length > 0 ? (
                  <div className="space-dropdown__section">
                    {spaces.map((spaceItem, index) => (
                      <SpaceItem
                        // 确认 key 是否稳定且唯一，dbKey 应该可以
                        key={spaceItem.dbKey || spaceItem.spaceId}
                        spaceItem={spaceItem}
                        isCurrentSpace={isCurrentSpace(spaceItem.spaceId)}
                        index={index}
                        listRef={(node) => (listRef.current[index] = node)}
                        getItemProps={getItemProps}
                        onSelect={handleOptionClick}
                        onSettingsClick={(e) =>
                          handleSettingsClick(e, spaceItem.dbKey)
                        } // 确认传递 dbKey
                      />
                    ))}
                  </div>
                ) : // 如果正在加载，显示加载提示；否则显示“无空间”
                loading ? (
                  <div className="space-dropdown__empty">{t("loading")}</div>
                ) : (
                  <div className="space-dropdown__empty">{t("no_spaces")}</div>
                )}

                {/* 创建按钮 */}
                <CreateSpaceButton
                  onClick={openModal}
                  getItemProps={getItemProps}
                  listRef={(node) => (listRef.current[spacesLength] = node)}
                  index={spacesLength}
                  // 如果正在加载，可以考虑禁用创建按钮
                  disabled={loading}
                />
              </div>
            </div>
          </FloatingFocusManager>
        )}
      </div>
      {/* <NavIconItem path="/" icon={<PlusIcon size={22} />} /> */}
      <CreateMenu />

      {/* Modal for Creating Space */}
      <Dialog isOpen={visible} onClose={closeModal}>
        <CreateSpaceForm onClose={closeModal} />
      </Dialog>

      {/* --- Styles (保持不变) --- */}
      <style>{`
        .space-sidebar-top {
          display: flex;
          padding: 16px;
          gap: 12px;
          align-items: center;
          background: ${theme.background};
        }

        .space-dropdown {
          flex: 1;
          min-width: 0;
          position: relative;
        }

        .space-dropdown__trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          height: 32px;
          padding: 0 12px;
          border-radius: 6px;
          cursor: pointer;
          background: ${theme.backgroundSecondary};
          border: 1px solid transparent;
          transition: all 0.15s ease;
          font-weight: 500;
          color: ${theme.text};
        }

        .space-dropdown__trigger:hover {
          background: ${theme.backgroundHover};
        }

        .space-dropdown__trigger.is-open {
          background: ${theme.backgroundActive || theme.backgroundHover};
          border-color: ${theme.primary};
          box-shadow: 0 0 0 1px ${theme.primaryLight};
        }

        .space-dropdown__trigger.is-loading {
          opacity: 0.7;
          cursor: default;
        }

        .space-dropdown__trigger:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px ${theme.primaryLight};
          border-color: ${theme.primary};
        }

        .space-dropdown__name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 13px;
          color: ${theme.text};
          flex: 1;
          min-width: 0;
          margin-right: 8px;
        }

        .space-dropdown__icon {
          transition:
            transform 0.2s ease,
            color 0.2s ease;
          transform: ${isOpen ? "rotate(180deg)" : "rotate(0deg)"};
          color: ${isOpen ? theme.primary : theme.textTertiary};
          flex-shrink: 0;
        }

        .space-dropdown__menu {
          background: ${theme.background};
          border-radius: 10px;
          box-shadow:
            0 6px 20px ${theme.shadowMedium},
            0 0 0 1px ${theme.border};
          overflow: hidden;
          z-index: ${zIndex.spaceDropdownZIndex};
          margin-top: 6px;
          backdrop-filter: blur(8px);
        }

        .space-dropdown__content {
          max-height: 340px;
          overflow-y: auto;
          padding: 6px;
        }

        .space-dropdown__section {
          position: relative;
        }

        .space-dropdown__empty {
          padding: 12px;
          font-size: 13px;
          color: ${theme.textSecondary};
          text-align: center;
          margin: 4px 0;
        }

        /* Scrollbar styles */
        .space-dropdown__content::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .space-dropdown__content::-webkit-scrollbar-track {
          background: transparent;
        }
        .space-dropdown__content::-webkit-scrollbar-thumb {
          background: ${theme.textLight};
          border-radius: 10px;
        }
        .space-dropdown__content::-webkit-scrollbar-thumb:hover {
          background: ${theme.textQuaternary};
        }
        .space-dropdown__content {
          scrollbar-width: thin;
          scrollbar-color: ${theme.textLight} transparent;
        }
      `}</style>
    </div>
  );
};
