// render/layout/SidebarTop.tsx (已更新图标)

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
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
import { SpaceItem } from "create/space/components/SpaceItem";

// [修复] 遵循技术栈规范，并根据指示使用 LuHouse
import { LuHouse, LuChevronDown } from "react-icons/lu";
import { zIndex } from "../styles/zIndex";

// Custom hook to detect clicks outside a specified element
const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useClickOutside(dropdownRef, () => setIsDropdownOpen(false));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
      }
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

  return (
    <>
      <div className="SidebarTop">
        <NavLink
          to="/"
          className="SidebarTop__homeButton"
          aria-label={t("home")}
        >
          {/* [修正] 根据指示，使用 LuHouse 图标 */}
          <LuHouse size={16} />
        </NavLink>

        <div className="SidebarTop__dropdown" ref={dropdownRef}>
          <button
            type="button"
            className="SidebarTop__trigger"
            onClick={() => !loading && setIsDropdownOpen((v) => !v)}
            disabled={loading}
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
            aria-controls={isDropdownOpen ? menuId : undefined}
          >
            <span className="SidebarTop__label" title={space?.name}>
              {loading ? t("loading") : space?.name || t("select_space")}
            </span>
            <LuChevronDown size={16} className="SidebarTop__chevron" />
          </button>

          {isDropdownOpen && (
            <div id={menuId} className="SidebarTop__menu" role="menu">
              <div className="SidebarTop__content">
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

      <style href="SidebarTop-styles" precedence="component">{`
        @keyframes SidebarTop-slideIn {
          from {
            opacity: 0;
            transform: translateY(calc(var(--space-1) * -1)) scale(0.98);
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
          background-color: transparent;
          flex-shrink: 0;
          box-sizing: border-box;
          border-bottom: 1px solid var(--border);
        }

        .SidebarTop__homeButton {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          flex-shrink: 0;
          border-radius: 6px;
          color: var(--textTertiary);
          background: transparent;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: background-color 0.2s ease, color 0.2s ease;
        }

        .SidebarTop__homeButton:hover {
          color: var(--text);
          background-color: var(--backgroundHover);
        }

        .SidebarTop__homeButton.active {
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
          height: 32px;
          padding: 0 var(--space-2) 0 var(--space-3);
          border-radius: 6px;
          border: 1px solid var(--border);
          background-color: var(--background);
          cursor: pointer;
          font-family: inherit;
          transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .SidebarTop__trigger:hover:not(:disabled):not([aria-expanded="true"]) {
          background-color: var(--backgroundHover);
          border-color: var(--borderHover);
        }

        .SidebarTop__trigger[aria-expanded="true"] {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--focus);
        }

        .SidebarTop__trigger:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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
        }

        .SidebarTop__chevron {
          color: var(--textTertiary);
          transition: transform 0.25s ease, color 0.25s ease;
          flex-shrink: 0;
          margin-left: var(--space-1);
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
          background-color: var(--backgroundGhost, var(--background));
          border-radius: var(--space-2);
          border: 1px solid var(--border);
          box-shadow: 0 8px 24px var(--shadowMedium), 0 2px 6px var(--shadowLight);
          z-index: ${zIndex.dropdown};
          animation: SidebarTop-slideIn 0.15s cubic-bezier(0.1, 0, 0, 1);
          transform-origin: top;
          backdrop-filter: blur(12px);
          min-width: 200px;
        }

        .SidebarTop__content {
          max-height: 40vh;
          overflow-y: auto;
          padding: var(--space-1);
        }
        
        .SidebarTop__item {
          display: flex;
          align-items: center;
          width: 100%;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          border-radius: 6px;
          font-size: 0.875rem;
          text-align: left;
          cursor: pointer;
          border: none;
          background-color: transparent;
          color: var(--text);
          font-family: inherit;
          transition: background-color 0.2s ease, color 0.2s ease;
        }

        .SidebarTop__item:hover {
          background-color: var(--backgroundHover);
        }
        
        .SidebarTop__item--empty {
          color: var(--textTertiary);
          justify-content: center;
          cursor: default;
          font-style: italic;
          font-size: 0.8rem;
        }

        .SidebarTop__item--empty:hover {
          background-color: transparent;
        }

        .SidebarTop__item svg {
          flex-shrink: 0;
        }
      `}</style>
    </>
  );
};
