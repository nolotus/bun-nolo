// render/layout/SidebarTop.tsx

import React, {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  lazy,
  Suspense,
} from "react";
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
// 注意：SpaceItem 改为懒加载
// import { SpaceItem } from "create/space/components/SpaceItem";
import { useClickOutside } from "app/hooks/useClickOutside";
import { LuHouse, LuChevronDown } from "react-icons/lu";
import { zIndex } from "../styles/zIndex";

// 懒加载 SpaceItem（将命名导出映射为默认导出）
const loadSpaceItem = () =>
  import("create/space/components/SpaceItem").then((m) => ({
    default: m.SpaceItem,
  }));
const SpaceItem = lazy(loadSpaceItem);

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

  // 悬停/聚焦时预取 SpaceItem 代码块，减少点击时等待
  const warmupDropdown = useCallback(() => {
    loadSpaceItem();
  }, []);

  return (
    <>
      <div className="SidebarTop">
        <NavLink
          to="/"
          className="SidebarTop__homeButton"
          aria-label={t("home")}
        >
          <LuHouse size={16} />
        </NavLink>

        <div className="SidebarTop__dropdown" ref={dropdownRef}>
          <button
            type="button"
            className="SidebarTop__trigger"
            onPointerEnter={warmupDropdown}
            onFocus={warmupDropdown}
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
                <Suspense
                  fallback={
                    <div className="SidebarTop__item SidebarTop__item--empty">
                      {t("loading")}
                    </div>
                  }
                >
                  {spaces.length > 0 ? (
                    spaces.map((s: any) => (
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
                </Suspense>
              </div>
            </div>
          )}
        </div>
      </div>

      <style href="SidebarTop-styles" precedence="component">{`
        @keyframes SidebarTop-slideIn {
          from { opacity: 0; transform: translateY(calc(var(--space-1) * -1)) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .SidebarTop {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2);
          height: var(--headerHeight);
          flex-shrink: 0;
          box-sizing: border-box;

          /* 左上角柔和光源效果 */
          background-color: var(--background);
          background-image: radial-gradient(
            ellipse 80% 150% at 0% 0%,
            var(--focus) 0%,
            transparent 70%
          );
          background-repeat: no-repeat;
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
        .SidebarTop__homeButton:hover { color: var(--text); background-color: var(--backgroundHover); }
        .SidebarTop__homeButton.active { background-color: var(--primaryGhost); color: var(--primary); }

        .SidebarTop__dropdown { flex: 1; position: relative; min-width: 0; }

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
        .SidebarTop__trigger:disabled { opacity: 0.6; cursor: not-allowed; }

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
        .SidebarTop__item:hover { background-color: var(--backgroundHover); }

        .SidebarTop__item--empty {
          color: var(--textTertiary);
          justify-content: center;
          cursor: default;
          font-style: italic;
          font-size: 0.8rem;
        }
        .SidebarTop__item--empty:hover { background-color: transparent; }

        .SidebarTop__item svg { flex-shrink: 0; }
      `}</style>
    </>
  );
};
