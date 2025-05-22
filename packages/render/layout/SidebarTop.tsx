import React, { useEffect, useRef, useState } from "react";
import {
  FloatingFocusManager,
  autoUpdate,
  flip,
  offset,
  shift,
  size,
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
  selectAllMemberSpaces,
  selectCurrentSpace,
  selectSpaceLoading,
} from "create/space/spaceSlice";
import { useTranslation } from "react-i18next";
import { RxDropdownMenu } from "react-icons/rx";
import { useNavigate } from "react-router-dom";
import { Dialog } from "render/web/ui/Dialog";
import { useModal } from "render/ui/Modal";
import { useTheme } from "app/theme";
import { zIndex } from "../styles/zIndex";
import { CreateSpaceButton } from "create/space/CreateSpaceButton";
import { createSpaceKey } from "create/space/spaceKeys";
import { SpaceItem } from "create/space/components/SpaceItem";
import { CreateMenu } from "create/CreateMenu";
import { useAuth } from "auth/hooks/useAuth";
import { HomeIcon } from "@primer/octicons-react";

export const SidebarTop = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const spaces = useAppSelector(selectAllMemberSpaces) || [];
  const space = useAppSelector(selectCurrentSpace);
  const loading = useAppSelector(selectSpaceLoading);

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { visible, open: openModal, close: closeModal } = useModal();

  const spacesLength = spaces.length;
  const listRef = useRef<Array<HTMLElement | null>>(
    new Array(spacesLength + 1).fill(null)
  );

  // 用 ref 绑定整个trigger容器
  const triggerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    listRef.current = Array(spaces.length + 1).fill(null);
    if (isOpen) setActiveIndex(null);
  }, [spaces.length, isOpen]);

  // --------- Floating UI ---------
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
            width: `${Math.max(rects.reference.width, 180)}px`,
            maxWidth: "calc(100vw - 32px)",
          });
        },
      }),
    ],
  });

  useEffect(() => {
    if (triggerRef.current) {
      refs.setReference(triggerRef.current);
    }
  }, [refs]);

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    initial: { opacity: 0, transform: "translateY(-4px)" },
    open: { opacity: 1, transform: "translateY(0)" },
    close: { opacity: 0, transform: "translateY(-4px)" },
    duration: { open: 150, close: 100 },
  });

  const dismiss = useDismiss(context);
  const role = useRole(context);
  const listNavigation = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    loop: true,
  });

  const { getFloatingProps, getItemProps } = useInteractions([
    dismiss,
    role,
    listNavigation,
  ]);

  // --------- 事件处理 ---------
  const handleCurrentSpaceClick = () => {
    if (!loading && space?.id) {
      navigate(`/space/${space.id}`);
    }
  };

  const handleOptionClick = (spaceId?: string) => {
    if (!spaceId) return;
    dispatch(changeSpace(spaceId));
    navigate(`/space/${spaceId}`);
    setIsOpen(false);
  };

  const handleSettingsClick = (
    e: React.MouseEvent,
    spaceMemberpath: string
  ) => {
    e.stopPropagation();
    const spaceId = createSpaceKey.spaceIdFromMember(spaceMemberpath);
    if (spaceId) {
      navigate(`/space/${spaceId}/settings`);
      setIsOpen(false);
    }
  };

  const isCurrentSpace = (spaceId: string) => space?.id === spaceId;

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!loading) {
      setIsOpen(!isOpen);
    }
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  // --------- 渲染 ---------
  return (
    <div className="space-sidebar-top" role="navigation">
      <button
        className="home-icon-button"
        onClick={handleHomeClick}
        aria-label={t("home")}
      >
        <HomeIcon size={16} />
      </button>
      <div className="space-dropdown">
        {/* 整个trigger容器作为reference */}
        <div
          className={`space-dropdown__trigger ${isOpen ? "is-open" : ""} ${loading ? "is-loading" : ""}`}
          ref={triggerRef}
        >
          <span
            className="space-dropdown__name"
            title={space?.name}
            tabIndex={loading ? -1 : 0}
            role="button"
            onClick={handleCurrentSpaceClick}
            onKeyDown={(e) => {
              if (!loading && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                handleCurrentSpaceClick();
              }
            }}
            aria-label={t("select_space")}
            aria-disabled={loading}
          >
            {loading ? (
              <span className="space-dropdown__loading-text">
                {t("loading")}
              </span>
            ) : (
              space?.name || t("select_space")
            )}
          </span>
          <button
            type="button"
            className="space-dropdown__icon-btn"
            aria-label={t("space_dropdown")}
            aria-expanded={isOpen}
            disabled={loading}
            tabIndex={0}
            onClick={toggleDropdown}
            onKeyDown={(e) => {
              if (!loading && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                toggleDropdown(e as any);
              }
            }}
          >
            <RxDropdownMenu size={14} className="space-dropdown__icon" />
          </button>
        </div>

        {/* ------------------ 下拉 ------------------ */}
        {isMounted && (
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
                {loading ? (
                  <div className="space-dropdown__loading-state">
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                  </div>
                ) : spaces.length > 0 ? (
                  <div className="space-dropdown__spaces">
                    {spaces.map((spaceItem, index) => (
                      <SpaceItem
                        key={spaceItem.dbKey || spaceItem.spaceId}
                        spaceItem={spaceItem}
                        isCurrentSpace={isCurrentSpace(spaceItem.spaceId)}
                        index={index}
                        listRef={(node) => (listRef.current[index] = node)}
                        getItemProps={getItemProps}
                        onSelect={handleOptionClick}
                        onSettingsClick={(e) =>
                          handleSettingsClick(e, spaceItem.dbKey)
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-dropdown__empty">{t("no_spaces")}</div>
                )}

                {!loading && spaces.length > 0 && (
                  <div className="space-dropdown__divider"></div>
                )}

                {!loading && (
                  <div className="space-dropdown__create-container">
                    <CreateSpaceButton
                      onClick={openModal}
                      getItemProps={getItemProps}
                      listRef={(node) => (listRef.current[spacesLength] = node)}
                      index={spacesLength}
                      disabled={loading}
                    />
                  </div>
                )}
              </div>
            </div>
          </FloatingFocusManager>
        )}
      </div>
      <CreateMenu />
      <Dialog isOpen={visible} onClose={closeModal}>
        <CreateSpaceForm onClose={closeModal} />
      </Dialog>
      <style>{`
        .space-sidebar-top {
          display: flex;
          padding: ${theme.space[3]}; /* 12px */
          gap: ${theme.space[3]}; /* 12px */
          align-items: center;
          background: ${theme.background};
          height: ${theme.space[12]}; /* 48px */
        }
        .space-dropdown {
          flex: 1;
          min-width: 0;
          position: relative;
        }
        .space-dropdown__trigger {
          display: flex;
          align-items: center;
          width: 100%;
          height: ${theme.space[8]}; /* 32px */
          padding: 0;
          background: ${theme.backgroundSecondary};
          border-radius: 6px;
          border: 1px solid transparent;
          transition: all 0.15s ease;
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
        .space-dropdown__name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 13px;
          color: ${theme.text};
          flex: 1;
          min-width: 0;
          padding: 0 ${theme.space[3]}; /* 12px */
          font-weight: 500;
          line-height: 30px;
          height: 100%;
          user-select: none;
          border-radius: 6px 0 0 6px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .space-dropdown__name:hover {
          background: ${theme.backgroundHover};
        }
        .space-dropdown__name:focus-visible {
          outline: none;
          background: ${theme.backgroundHover};
        }
        .space-dropdown__loading-text {
          opacity: 0.7;
        }
        .space-dropdown__icon-btn {
          height: 100%;
          width: ${theme.space[8]}; /* 32px */
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          border-radius: 0 6px 6px 0;
          cursor: pointer;
          color: ${theme.textSecondary};
          transition: all 0.15s;
          padding: 0;
        }
        .space-dropdown__icon-btn:hover {
          background: ${theme.backgroundHover};
          color: ${theme.text};
        }
        .space-dropdown__icon-btn:focus-visible {
          outline: none;
          background: ${theme.backgroundHover};
          color: ${theme.text};
        }
        .space-dropdown__icon-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .space-dropdown__icon {
          transition: transform 0.2s, color 0.2s;
          transform: ${isOpen ? "rotate(180deg)" : "rotate(0deg)"};
          color: ${isOpen ? theme.primary : theme.textTertiary};
        }
        .space-dropdown__menu {
          background: ${theme.background};
          border-radius: 8px;
          border: 1px solid ${theme.borderLight};
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.03);
          z-index: ${zIndex.spaceDropdownZIndex};
          margin-top: ${theme.space[1]}; /* 4px */
          overflow: hidden;
          backdrop-filter: blur(8px);
        }
        .space-dropdown__content {
          max-height: 300px;
          overflow-y: auto;
          padding: ${theme.space[2]}; /* 8px */
          scrollbar-width: thin;
          scrollbar-color: ${theme.textLight} transparent;
        }
        .space-dropdown__content::-webkit-scrollbar {
          width: 4px;
        }
        .space-dropdown__content::-webkit-scrollbar-track {
          background: transparent;
        }
        .space-dropdown__content::-webkit-scrollbar-thumb {
          background: ${theme.textLight};
          border-radius: 4px;
        }
        .space-dropdown__loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: ${theme.space[2]}; /* 8px */
          padding: ${theme.space[3]} 0; /* 12px */
        }
        .loading-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${theme.primary};
          animation: pulse 1.4s infinite ease-in-out;
          opacity: 0.7;
        }
        .loading-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .loading-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(0.6);
            opacity: 0.5;
          }
          50% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .space-dropdown__divider {
          height: 1px;
          margin: ${theme.space[1]} 0; /* 4px */
          background-color: ${theme.borderLight};
          opacity: 0.6;
        }
        .space-dropdown__empty {
          padding: ${theme.space[3]}; /* 12px */
          color: ${theme.textSecondary};
          text-align: center;
          font-size: 13px;
        }
        .space-dropdown__spaces {
          padding: 0;
        }
        .space-dropdown__create-container {
          padding: 2px 0;
        }
        .home-icon-button {
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          cursor: pointer;
          color: ${theme.textSecondary};
          width: ${theme.space[8]}; /* 32px */
          height: ${theme.space[8]}; /* 32px */
          border-radius: 6px;
          transition: all 0.15s ease;
        }
        .home-icon-button:hover {
          background: ${theme.backgroundHover};
          color: ${theme.text};
        }
        .home-icon-button:focus-visible {
          outline: none;
          background: ${theme.backgroundHover};
          color: ${theme.text};
        }
      `}</style>
    </div>
  );
};
