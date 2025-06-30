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
        @keyframes SidebarTop-pulse {
          0%, 100% { 
            background-color: var(--backgroundTertiary); 
            opacity: 0.8;
          }
          50% { 
            background-color: var(--backgroundHover); 
            opacity: 1;
          }
        }

        @keyframes SidebarTop-slideIn {
          from { 
            opacity: 0; 
            transform: translateY(-8px) scale(0.96); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }

        .SidebarTop {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2);
          height: var(--headerHeight);
          background-color: var(--background);
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
          box-sizing: border-box;
        }

        .SidebarTop__homeButton {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          flex-shrink: 0;
          border-radius: var(--space-2);
          color: var(--textTertiary);
          background: transparent;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
          position: relative;
          overflow: hidden;
        }

        .SidebarTop__homeButton::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--backgroundHover);
          opacity: 0;
          transition: opacity 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
          border-radius: inherit;
        }

        .SidebarTop__homeButton:hover::before {
          opacity: 1;
        }

        .SidebarTop__homeButton:hover {
          color: var(--text);
          transform: translateY(-1px);
        }

        .SidebarTop__homeButton.active {
          background-color: var(--primaryGhost);
          color: var(--primary);
        }

        .SidebarTop__homeButton.active::before {
          display: none;
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
          height: 32px;
          padding: 0 var(--space-2) 0 var(--space-3);
          border-radius: var(--space-2);
          border: 1px solid var(--border);
          background-color: var(--background);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
          position: relative;
          overflow: hidden;
          font-family: inherit;
        }

        .SidebarTop__trigger::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--backgroundHover);
          opacity: 0;
          transition: opacity 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
          border-radius: inherit;
        }

        .SidebarTop__trigger:hover:not(:disabled)::before {
          opacity: 1;
        }

        .SidebarTop__trigger:hover:not(:disabled) {
          border-color: var(--borderHover);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px var(--shadowLight);
        }

        .SidebarTop__trigger[aria-expanded="true"] {
          background-color: var(--backgroundSelected);
          border-color: var(--primary);
          box-shadow: 0 0 0 2px var(--focus);
          transform: none;
        }

        .SidebarTop__trigger[aria-expanded="true"]::before {
          display: none;
        }

        .SidebarTop__trigger:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          animation: SidebarTop-pulse 2s infinite ease-in-out;
          border-color: var(--border);
        }

        .SidebarTop__trigger:disabled:hover {
          transform: none;
          box-shadow: none;
        }

        .SidebarTop__label {
          flex: 1;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: left;
          position: relative;
          z-index: 1;
        }

        .SidebarTop__chevron {
          color: var(--textTertiary);
          transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
          position: relative;
          z-index: 1;
          flex-shrink: 0;
        }

        .SidebarTop__trigger[aria-expanded="true"] .SidebarTop__chevron {
          transform: rotate(180deg);
          color: var(--primary);
        }

        .SidebarTop__menu {
          position: absolute;
          top: calc(100% + var(--space-2));
          left: 0;
          right: 0;
          background: var(--background);
          border-radius: var(--space-2);
          border: 1px solid var(--border);
          box-shadow: 
            0 8px 24px var(--shadowMedium),
            0 2px 6px var(--shadowLight);
          z-index: ${zIndex.spaceDropdownZIndex};
          animation: SidebarTop-slideIn 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
          transform-origin: top;
          backdrop-filter: blur(12px);
          min-width: 200px;
        }

        .SidebarTop__content {
          max-height: 40vh;
          overflow-y: auto;
          padding: var(--space-1);
          scrollbar-width: thin;
          scrollbar-color: var(--textLight) transparent;
        }

        .SidebarTop__content::-webkit-scrollbar {
          width: 4px;
        }

        .SidebarTop__content::-webkit-scrollbar-track {
          background: transparent;
          margin: var(--space-1) 0;
        }

        .SidebarTop__content::-webkit-scrollbar-thumb {
          background-color: var(--textLight);
          border-radius: var(--space-2);
          transition: background-color 0.2s ease;
        }

        .SidebarTop__content::-webkit-scrollbar-thumb:hover {
          background-color: var(--textTertiary);
        }
        
        .SidebarTop__separator {
          height: 1px;
          background: var(--border);
          margin: var(--space-1) var(--space-2);
        }
        
        .SidebarTop__item {
          display: flex;
          align-items: center;
          width: 100%;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--space-2);
          font-size: 0.875rem;
          font-weight: 400;
          text-align: left;
          cursor: pointer;
          border: none;
          background-color: transparent;
          transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
          position: relative;
          overflow: hidden;
          color: var(--text);
          font-family: inherit;
        }

        .SidebarTop__item::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--backgroundHover);
          opacity: 0;
          transition: opacity 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
          border-radius: inherit;
        }

        .SidebarTop__item:hover::before {
          opacity: 1;
        }

        .SidebarTop__item:hover {
          transform: translateY(-1px);
        }

        .SidebarTop__item--create {
          font-weight: 500;
          color: var(--textSecondary);
        }

        .SidebarTop__item--create::before {
          background: var(--primaryGhost);
        }

        .SidebarTop__item--create:hover {
          color: var(--primary);
        }

        .SidebarTop__item--empty {
          color: var(--textTertiary);
          justify-content: center;
          cursor: default;
          font-style: italic;
          font-size: 0.8rem;
        }

        .SidebarTop__item--empty::before {
          display: none;
        }

        .SidebarTop__item--empty:hover {
          transform: none;
        }

        /* 图标样式 */
        .SidebarTop__item svg {
          position: relative;
          z-index: 1;
          flex-shrink: 0;
        }

        .SidebarTop__item span {
          position: relative;
          z-index: 1;
        }
      `}</style>
    </>
  );
};
