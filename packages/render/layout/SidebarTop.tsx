import React, { useEffect, useRef, useState } from "react";
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
import { useNavigate, NavLink } from "react-router-dom";
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

  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // ESC 键关闭下拉菜单
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  // 事件处理
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

  return (
    <div className="space-sidebar-top" role="navigation">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `home-icon-button ${isActive ? "home-icon-button--active" : ""}`
        }
        aria-label={t("home")}
      >
        <HomeIcon size={16} />
      </NavLink>

      <div className="space-dropdown" ref={dropdownRef}>
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

        {/* 下拉菜单 */}
        {isOpen && (
          <div
            ref={menuRef}
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
                  <CreateSpaceButton onClick={openModal} disabled={loading} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <CreateMenu />
      <Dialog isOpen={visible} onClose={closeModal}>
        <CreateSpaceForm onClose={closeModal} />
      </Dialog>

      <style>{`
        .space-sidebar-top {
          display: flex;
          padding: 12px;
          gap: 12px;
          align-items: center;
          background: ${theme.background};
          height: 48px;
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
          height: 32px;
          background: ${theme.backgroundSecondary};
          border-radius: 6px;
          border: 1px solid ${theme.borderLight};
          transition: all 0.12s ease-out;
          overflow: hidden;
        }

        .space-dropdown__trigger:hover {
          border-color: ${theme.textSecondary};
          background: ${theme.backgroundHover};
        }

        .space-dropdown__trigger.is-open {
          border-color: ${theme.primary};
          background: ${theme.backgroundHover};
          box-shadow: 0 0 0 1px ${theme.primaryLight};
        }

        .space-dropdown__trigger.is-loading {
          opacity: 0.6;
          cursor: default;
          pointer-events: none;
        }

        .space-dropdown__name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 13px;
          font-weight: 500;
          color: ${theme.text};
          flex: 1;
          min-width: 0;
          padding: 0 12px;
          height: 100%;
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: color 0.12s ease;
          user-select: none;
        }

        .space-dropdown__name:hover {
          color: ${theme.textDark || theme.text};
        }

        .space-dropdown__name:focus-visible {
          outline: none;
          color: ${theme.primary};
        }

        .space-dropdown__loading-text {
          opacity: 0.6;
          font-weight: 400;
        }

        .space-dropdown__icon-btn {
          height: 100%;
          width: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          cursor: pointer;
          color: ${theme.textSecondary};
          transition: all 0.12s ease;
          border-left: 1px solid ${theme.borderLight};
        }

        .space-dropdown__icon-btn:hover {
          background: ${theme.backgroundTertiary};
          color: ${theme.text};
        }

        .space-dropdown__icon-btn:focus-visible {
          outline: none;
          background: ${theme.backgroundTertiary};
          color: ${theme.text};
        }

        .space-dropdown__icon-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .space-dropdown__icon {
          transition: transform 0.15s ease-out;
          transform: ${isOpen ? "rotate(180deg)" : "rotate(0deg)"};
        }

        .space-dropdown__menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 4px;
          background: ${theme.background};
          border-radius: 8px;
          border: 1px solid ${theme.borderLight};
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04);
          z-index: ${zIndex.spaceDropdownZIndex};
          overflow: hidden;
          animation: slideIn 0.12s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-4px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .space-dropdown__content {
          max-height: 280px;
          overflow-y: auto;
          padding: 8px;
          scrollbar-width: thin;
          scrollbar-color: ${theme.borderLight} transparent;
        }

        .space-dropdown__content::-webkit-scrollbar {
          width: 4px;
        }

        .space-dropdown__content::-webkit-scrollbar-track {
          background: transparent;
        }

        .space-dropdown__content::-webkit-scrollbar-thumb {
          background: ${theme.borderLight};
          border-radius: 2px;
        }

        .space-dropdown__content::-webkit-scrollbar-thumb:hover {
          background: ${theme.textSecondary};
        }

        .space-dropdown__loading-state {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 16px 0;
        }

        .loading-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: ${theme.textSecondary};
          animation: pulse 1.2s infinite ease-in-out;
        }

        .loading-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .loading-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
        }

        .space-dropdown__divider {
          height: 1px;
          margin: 6px 0;
          background: ${theme.borderLight};
          opacity: 0.6;
        }

        .space-dropdown__empty {
          padding: 16px 12px;
          color: ${theme.textSecondary};
          text-align: center;
          font-size: 13px;
        }

        .space-dropdown__spaces {
          padding: 0;
        }

        .space-dropdown__create-container {
          padding: 0;
        }

        .home-icon-button {
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          color: ${theme.textSecondary};
          width: 32px;
          height: 32px;
          border-radius: 6px;
          transition: all 0.12s ease;
          text-decoration: none;
        }

        .home-icon-button:hover {
          background: ${theme.backgroundHover};
          color: ${theme.text};
          border-color: ${theme.borderLight};
        }

        .home-icon-button:focus-visible {
          outline: none;
          background: ${theme.backgroundHover};
          color: ${theme.text};
          border-color: ${theme.primary};
        }

        .home-icon-button--active {
          background: ${theme.backgroundSecondary};
          color: ${theme.primary};
          border-color: ${theme.primaryLight};
        }
      `}</style>
    </div>
  );
};
