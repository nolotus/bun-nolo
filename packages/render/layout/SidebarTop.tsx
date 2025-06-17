import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import {
  changeSpace,
  selectAllMemberSpaces,
  selectCurrentSpace,
  selectSpaceLoading,
} from "create/space/spaceSlice";
import { useTranslation } from "react-i18next";
import { RxDropdownMenu } from "react-icons/rx";
import { useNavigate, NavLink } from "react-router-dom";
import { useTheme } from "app/theme";
import { zIndex } from "../styles/zIndex";
import { createSpaceKey } from "create/space/spaceKeys";
import { SpaceItem } from "create/space/components/SpaceItem";
import { CreateMenu } from "create/CreateMenu";
import { useAuth } from "auth/hooks/useAuth";
import { HomeIcon } from "@primer/octicons-react";

export const SidebarTop: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const spaces = useAppSelector(selectAllMemberSpaces) || [];
  const space = useAppSelector(selectCurrentSpace);
  const loading = useAppSelector(selectSpaceLoading);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部或ESC关闭
  useEffect(() => {
    if (!isOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const handleCurrentSpaceClick = () => {
    if (!loading && space?.id) navigate(`/space/${space.id}`);
  };

  const handleOptionClick = (id?: string) => {
    if (!id) return;
    dispatch(changeSpace(id));
    navigate(`/space/${id}`);
    setIsOpen(false);
  };

  const handleSettingsClick = (e: React.MouseEvent, dbKey: string) => {
    e.stopPropagation();
    const id = createSpaceKey.spaceIdFromMember(dbKey);
    if (id) {
      navigate(`/space/${id}/settings`);
      setIsOpen(false);
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
          className={`space-dropdown__trigger ${
            isOpen ? "is-open" : ""
          } ${loading ? "is-loading" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            if (!loading) setIsOpen((o) => !o);
          }}
        >
          <span
            className="space-dropdown__name"
            title={space?.name}
            tabIndex={loading ? -1 : 0}
            role="button"
            onClick={handleCurrentSpaceClick}
            onKeyDown={(e) => {
              if (!loading && ["Enter", " "].includes(e.key)) {
                e.preventDefault();
                handleCurrentSpaceClick();
              }
            }}
            aria-label={t("select_space")}
            aria-disabled={loading}
          >
            {loading ? t("loading") : space?.name || t("select_space")}
          </span>
          <button
            type="button"
            className="space-dropdown__icon-btn"
            aria-label={t("space_dropdown")}
            aria-expanded={isOpen}
            disabled={loading}
          >
            <RxDropdownMenu size={14} className="space-dropdown__icon" />
          </button>
        </div>

        {isOpen && (
          <div
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
                  {spaces.map((s) => (
                    <SpaceItem
                      key={s.dbKey || s.spaceId}
                      spaceItem={s}
                      isCurrentSpace={space?.id === s.spaceId}
                      onSelect={() => handleOptionClick(s.spaceId)}
                      onSettingsClick={(e) => handleSettingsClick(e, s.dbKey)}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-dropdown__empty">{t("no_spaces")}</div>
              )}
            </div>
          </div>
        )}
      </div>

      <CreateMenu />

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
          transition: 0.12s;
          overflow: hidden;
          cursor: pointer;
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
          pointer-events: none;
        }
        .space-dropdown__name {
          flex: 1;
          padding: 0 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 13px;
          font-weight: 500;
          color: ${theme.text};
          user-select: none;
          display: flex;
          align-items: center;
          transition: color 0.12s;
        }
        .space-dropdown__icon-btn {
          width: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: ${theme.textSecondary};
          border-left: 1px solid ${theme.borderLight};
          transition: 0.12s;
        }
        .space-dropdown__icon-btn:hover,
        .space-dropdown__icon-btn:focus-visible {
          background: ${theme.backgroundTertiary};
          color: ${theme.text};
          outline: none;
        }
        .space-dropdown__icon-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .space-dropdown__icon {
          transition: transform 0.15s;
          transform: rotate(${isOpen ? 180 : 0}deg);
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
          box-shadow: 0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
          z-index: ${zIndex.spaceDropdownZIndex};
          overflow: hidden;
          animation: slideIn 0.12s ease-out;
        }
        @keyframes slideIn {
          from {opacity:0; transform:translateY(-4px) scale(0.98);}
          to {opacity:1; transform:translateY(0) scale(1);}
        }
        .space-dropdown__content {
          max-height: 280px;
          overflow-y: auto;
          padding: 8px;
        }
        .space-dropdown__loading-state {
          display: flex;
          justify-content: center;
          gap: 6px;
          padding: 16px 0;
        }
        .loading-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: ${theme.textSecondary};
          animation: pulse 1.2s infinite;
        }
        @keyframes pulse {
          0%,100% { opacity:0.4; }
          50% { opacity:1; }
        }

        .space-dropdown__empty {
          padding: 16px 12px;
          color: ${theme.textSecondary};
          text-align: center;
          font-size: 13px;
        }
        .home-icon-button {
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid transparent;
          color: ${theme.textSecondary};
          width: 32px;
          height: 32px;
          border-radius: 6px;
          transition: 0.12s;
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
