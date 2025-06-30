import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "app/store";
import {
  changeSpace,
  selectAllMemberSpaces,
  selectCurrentSpace,
  selectSpaceLoading,
} from "create/space/spaceSlice";
import { createSpaceKey } from "create/space/spaceKeys";

import { Dialog } from "render/web/ui/Dialog";
import { CreateSpaceForm } from "create/space/CreateSpaceForm";
import { SpaceItem } from "create/space/components/SpaceItem";

import { HomeIcon, PlusIcon, ChevronDownIcon } from "@primer/octicons-react";
import { zIndex } from "../styles/zIndex";

const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent) => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
};

export const SidebarTop: React.FC = () => {
  const { t } = useTranslation("space");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const spaces = useAppSelector(selectAllMemberSpaces) || [];
  const space = useAppSelector(selectCurrentSpace);
  const loading = useAppSelector(selectSpaceLoading);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsDropdownOpen(false));
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsDropdownOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelectSpace = useCallback(
    (spaceId?: string) => {
      if (!spaceId) return;
      dispatch(changeSpace(spaceId));
      navigate(`/space/${spaceId}`);
      setIsDropdownOpen(false);
    },
    [dispatch, navigate]
  );

  const openCreateModal = useCallback(() => {
    setIsModalOpen(true);
    setIsDropdownOpen(false);
  }, []);

  return (
    <>
      <div className="SidebarTop">
        {" "}
        {/* 根组件 */}
        <NavLink
          to="/"
          className="SidebarTop__homeButton"
          aria-label={t("home")}
        >
          <HomeIcon size={16} />
        </NavLink>
        <div className="SidebarTop__dropdown" ref={dropdownRef}>
          <button
            type="button"
            className="SidebarTop__trigger"
            onClick={() => !loading && setIsDropdownOpen((v) => !v)}
            disabled={loading}
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
          >
            <span className="SidebarTop__label" title={space?.name}>
              {loading ? t("loading") : space?.name || t("select_space")}
            </span>
            <ChevronDownIcon size={16} className="SidebarTop__chevron" />
          </button>

          {isDropdownOpen && (
            <div className="SidebarTop__menu">
              <div className="SidebarTop__content">
                <button
                  className="SidebarTop__item SidebarTop__item--create"
                  onClick={openCreateModal}
                >
                  <PlusIcon size={14} />
                  <span>{t("create_new_space")}</span>
                </button>
                <div className="SidebarTop__separator" />
                {spaces.length > 0 ? (
                  spaces.map((s) => (
                    <SpaceItem
                      key={s.dbKey || s.spaceId}
                      spaceItem={s}
                      isCurrentSpace={space?.id === s.spaceId}
                      onSelect={() => handleSelectSpace(s.spaceId)}
                      onSettingsClick={(e) => {
                        e.stopPropagation();
                        const id = createSpaceKey.spaceIdFromMember(s.dbKey);
                        if (id) {
                          navigate(`/space/${id}/settings`);
                          setIsDropdownOpen(false);
                        }
                      }}
                    />
                  ))
                ) : (
                  <div className="SidebarTop__item SidebarTop__item--empty">
                    {t("no_spaces_yet")}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CreateSpaceForm onClose={() => setIsModalOpen(false)} />
      </Dialog>

      <style href="SidebarTop-styles" precedence="component">{`
        @keyframes SidebarTop-subtle-pulse {
          0%, 100% { background-color: var(--backgroundTertiary); }
          50% { background-color: var(--backgroundHover); }
        }

        .SidebarTop {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2);
          height: var(--headerHeight);
          background-color: var(--backgroundSecondary);
        }

        .SidebarTop__homeButton {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          border-radius: 6px;
          color: var(--textSecondary);
          background: transparent;
          border: none;
          transition: background-color 0.15s ease, color 0.15s ease;
        }
        .SidebarTop__homeButton:hover {
          background-color: var(--backgroundHover);
          color: var(--text);
        }
        .SidebarTop__homeButton.active { /* For NavLink */
          background-color: var(--primaryGhost);
          color: var(--primary);
        }

        .SidebarTop__dropdown {
          flex: 1;
          position: relative;
          min-width: 0;
        }

        .SidebarTop__trigger {
          display: flex;
          align-items: center;
          width: 100%;
          height: 34px;
          padding: 0 var(--space-2) 0 var(--space-3);
          border-radius: 6px;
          border: none;
          background-color: var(--backgroundTertiary);
          cursor: pointer;
          transition: background-color 0.15s ease, box-shadow 0.15s ease;
        }
        .SidebarTop__trigger:hover {
          background-color: var(--backgroundHover);
        }
        .SidebarTop__trigger[aria-expanded="true"] {
          background-color: var(--backgroundSelected);
          box-shadow: 0 0 0 3px var(--focus);
        }
        .SidebarTop__trigger:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          animation: SidebarTop-subtle-pulse 1.5s infinite ease-in-out;
        }

        .SidebarTop__label {
          flex: 1;
          font-size: 14px;
          font-weight: 500;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: left;
        }

        .SidebarTop__chevron {
          color: var(--textTertiary);
          transition: transform 0.2s ease-out;
        }
        .SidebarTop__trigger[aria-expanded="true"] .SidebarTop__chevron {
          transform: rotate(180deg);
        }

        .SidebarTop__menu {
          position: absolute;
          top: calc(100% + var(--space-1));
          left: 0;
          right: 0;
          background: var(--background);
          border-radius: 8px;
          border: none;
          box-shadow: var(--shadowHeavy);
          z-index: ${zIndex.spaceDropdownZIndex};
          animation: SidebarTop-slideIn 0.12s ease-out;
          transform-origin: top;
        }

        @keyframes SidebarTop-slideIn {
          from { opacity: 0; transform: translateY(-4px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .SidebarTop__content {
          max-height: 40vh;
          overflow-y: auto;
          padding: var(--space-1);
        }
        
        .SidebarTop__separator {
          height: 1px;
          background: var(--borderLight);
          margin: var(--space-1) var(--space-2);
        }
        
        .SidebarTop__item {
          display: flex;
          align-items: center;
          width: 100%;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          border-radius: 6px;
          font-size: 14px;
          text-align: left;
          cursor: pointer;
          border: none;
          background-color: transparent;
          transition: background-color 0.15s ease;
        }
        .SidebarTop__item:hover {
           background-color: var(--backgroundHover);
        }
        .SidebarTop__item--create {
          font-weight: 500;
          color: var(--textSecondary);
        }
        .SidebarTop__item--create:hover {
          color: var(--primary);
          background-color: var(--primaryGhost);
        }
        .SidebarTop__item--empty {
            color: var(--textTertiary);
            justify-content: center;
            cursor: default;
        }
        .SidebarTop__item--empty:hover {
           background-color: transparent;
        }
      `}</style>
    </>
  );
};
