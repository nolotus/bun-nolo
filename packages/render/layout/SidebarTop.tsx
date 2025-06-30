// 文件路径: SidebarTop.tsx
import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "app/store";
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
import { useAuth } from "auth/hooks/useAuth";
import { HomeIcon, PlusIcon } from "@primer/octicons-react";
import { Dialog } from "render/web/ui/Dialog";
import { CreateSpaceForm } from "create/space/CreateSpaceForm";

export const SidebarTop: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation("space");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const spaces = useAppSelector(selectAllMemberSpaces) || [];
  const space = useAppSelector(selectCurrentSpace);
  const loading = useAppSelector(selectSpaceLoading);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 创建空间的 Modal 状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => {
    setIsModalOpen(true);
    setIsDropdownOpen(false);
  };
  const closeModal = () => setIsModalOpen(false);

  // 点击外部或ESC关闭下拉菜单
  useEffect(() => {
    if (!isDropdownOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isDropdownOpen]);

  const handleCurrentSpaceClick = () => {
    if (!loading && space?.id) navigate(`/space/${space.id}`);
  };

  const handleOptionClick = (id?: string) => {
    if (!id) return;
    dispatch(changeSpace(id));
    navigate(`/space/${id}`);
    setIsDropdownOpen(false);
  };

  const handleSettingsClick = (e: React.MouseEvent, dbKey: string) => {
    e.stopPropagation();
    const id = createSpaceKey.spaceIdFromMember(dbKey);
    if (id) {
      navigate(`/space/${id}/settings`);
      setIsDropdownOpen(false);
    }
  };

  return (
    <>
      <div className="space-sidebar-top">
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
              isDropdownOpen ? "is-open" : ""
            } ${loading ? "is-loading" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              if (!loading) setIsDropdownOpen((o) => !o);
            }}
          >
            <span
              className="space-dropdown__name"
              title={space?.name}
              onClick={handleCurrentSpaceClick}
            >
              {loading ? t("loading") : space?.name || t("select_space")}
            </span>
            <button
              type="button"
              className="space-dropdown__icon-btn"
              aria-expanded={isDropdownOpen}
              disabled={loading}
            >
              <RxDropdownMenu
                size={14}
                style={{ transform: `rotate(${isDropdownOpen ? 180 : 0}deg)` }}
              />
            </button>
          </div>

          {isDropdownOpen && (
            <div className="space-dropdown__menu">
              <div className="space-dropdown__content">
                {loading ? (
                  <div className="space-dropdown__loading">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                ) : (
                  <>
                    <button className="create-btn" onClick={openModal}>
                      <PlusIcon size={14} />
                      <span>{t("create_new_space")}</span>
                    </button>

                    {spaces.length > 0 ? (
                      spaces.map((s) => (
                        <SpaceItem
                          key={s.dbKey || s.spaceId}
                          spaceItem={s}
                          isCurrentSpace={space?.id === s.spaceId}
                          onSelect={() => handleOptionClick(s.spaceId)}
                          onSettingsClick={(e) =>
                            handleSettingsClick(e, s.dbKey)
                          }
                        />
                      ))
                    ) : (
                      <div className="empty-tip">{t("no_spaces_yet")}</div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <style>{`
          .space-sidebar-top {
            display: flex;
            padding: ${theme.space[3]};
            gap: ${theme.space[3]};
            align-items: center;
            background: ${theme.background};
            height: ${theme.headerHeight}px;
          }
          
          .space-dropdown {
            flex: 1;
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
            cursor: pointer;
            transition: all 0.12s;
          }
          
          .space-dropdown__trigger:hover {
            border-color: ${theme.border};
            background: ${theme.backgroundHover};
          }
          
          .space-dropdown__trigger.is-open {
            border-color: ${theme.primary};
            box-shadow: 0 0 0 2px ${theme.primaryAlpha}15;
          }
          
          .space-dropdown__trigger.is-loading {
            opacity: 0.6;
            pointer-events: none;
          }
          
          .space-dropdown__name {
            flex: 1;
            padding: 0 ${theme.space[3]};
            font-size: 13px;
            font-weight: 500;
            color: ${theme.text};
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          .space-dropdown__icon-btn {
            width: 32px;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            border: none;
            border-left: 1px solid ${theme.borderLight};
            color: ${theme.textSecondary};
            cursor: pointer;
            transition: all 0.12s;
          }
          
          .space-dropdown__icon-btn:hover {
            background: ${theme.backgroundTertiary};
            color: ${theme.text};
          }
          
          .space-dropdown__menu {
            position: absolute;
            top: calc(100% + 4px);
            left: 0;
            right: 0;
            background: ${theme.background};
            border-radius: 8px;
            border: 1px solid ${theme.border};
            box-shadow: ${theme.shadow2} 0 8px 24px;
            z-index: ${zIndex.spaceDropdownZIndex};
            animation: slideIn 0.12s ease-out;
          }
          
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(-4px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .space-dropdown__content {
            max-height: 320px;
            overflow-y: auto;
            padding: ${theme.space[2]};
          }
          
          .space-dropdown__loading {
            display: flex;
            justify-content: center;
            gap: 6px;
            padding: ${theme.space[4]} 0;
          }
          
          .dot {
            width: 4px;
            height: 4px;
            border-radius: 50%;
            background: ${theme.textSecondary};
            animation: pulse 1.2s infinite;
          }
          
          .dot:nth-child(2) { animation-delay: 0.2s; }
          .dot:nth-child(3) { animation-delay: 0.4s; }
          
          @keyframes pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }
          
          .create-btn {
            display: flex;
            align-items: center;
            gap: ${theme.space[2]};
            width: 100%;
            padding: ${theme.space[2]} ${theme.space[3]};
            background: ${theme.backgroundSecondary};
            border: none;
            border-radius: 6px;
            color: ${theme.textSecondary};
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.12s;
            margin-bottom: ${theme.space[2]};
          }
          
          .create-btn:hover {
            background: ${theme.primary};
            color: white;
          }
          
          .empty-tip {
            padding: ${theme.space[4]} ${theme.space[3]};
            color: ${theme.textTertiary};
            text-align: center;
            font-size: 13px;
          }
          
          .home-icon-button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 6px;
            background: transparent;
            border: 1px solid transparent;
            color: ${theme.textSecondary};
            text-decoration: none;
            transition: all 0.12s;
          }
          
          .home-icon-button:hover {
            background: ${theme.backgroundHover};
            color: ${theme.text};
            border-color: ${theme.borderLight};
          }
          
          .home-icon-button--active {
            background: ${theme.backgroundSecondary};
            color: ${theme.primary};
            border-color: ${theme.primaryLight};
          }
        `}</style>
      </div>

      <Dialog isOpen={isModalOpen} onClose={closeModal}>
        <div onClick={(e) => e.stopPropagation()}>
          <CreateSpaceForm onClose={closeModal} />
        </div>
      </Dialog>
    </>
  );
};
