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
import { useClickOutside } from "app/hooks/useClickOutside";
import { LuHouse, LuChevronDown, LuLoader } from "react-icons/lu";
import { zIndex } from "../styles/zIndex";

// 懒加载 SpaceItem
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

  const warmupDropdown = useCallback(() => {
    loadSpaceItem();
  }, []);

  return (
    <>
      <div className="SidebarTop">
        {/* Home 按钮：设计为圆形，更灵动 */}
        <NavLink
          to="/"
          className="SidebarTop__homeButton"
          title={t("home")}
          aria-label={t("home")}
        >
          <LuHouse size={18} />
        </NavLink>

        <div className="SidebarTop__dropdownWrapper" ref={dropdownRef}>
          <button
            type="button"
            className={`SidebarTop__trigger ${isDropdownOpen ? "active" : ""}`}
            onPointerEnter={warmupDropdown}
            onFocus={warmupDropdown}
            onClick={() => !loading && setIsDropdownOpen((v) => !v)}
            disabled={loading}
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
            aria-controls={isDropdownOpen ? menuId : undefined}
          >
            <span className="SidebarTop__label">
              {loading ? t("loading") : space?.name || t("select_space")}
            </span>
            {loading ? (
              <LuLoader className="SidebarTop__spinner" size={14} />
            ) : (
              <LuChevronDown size={16} className="SidebarTop__chevron" />
            )}
          </button>

          {isDropdownOpen && (
            <div id={menuId} className="SidebarTop__menu" role="menu">
              <div className="SidebarTop__content">
                <Suspense
                  fallback={
                    <div className="SidebarTop__loadingItem">
                      <LuLoader className="SidebarTop__spinner" />
                      <span>{t("loading")}</span>
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
                    <div className="SidebarTop__emptyItem">
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
        :root {
           --headerHeight: 60px; /* 稍微增高一点，更舒展 */
           --ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
        }

        .SidebarTop {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 16px;
          height: var(--headerHeight);
          flex-shrink: 0;
          background: transparent; /* 依赖 Sidebar 背景 */
        }

        /* === Home Button === */
        .SidebarTop__homeButton {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          border-radius: 50%; /* 圆形 */
          color: var(--textTertiary);
          background: transparent;
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.2s var(--ease-spring);
        }

        .SidebarTop__homeButton:hover {
          color: var(--text);
          background: var(--backgroundSecondary);
          transform: scale(1.05);
        }

        .SidebarTop__homeButton.active {
          color: var(--primary);
          background: var(--primaryGhost);
          box-shadow: 0 2px 8px rgba(var(--primary-rgb), 0.15);
        }

        /* === Dropdown Trigger === */
        .SidebarTop__dropdownWrapper {
          flex: 1;
          position: relative;
          min-width: 0;
        }

        .SidebarTop__trigger {
          display: flex;
          align-items: center;
          width: 100%;
          height: 36px;
          padding: 0 12px;
          border-radius: 10px; /* 柔和圆角 */
          /* 40% 拟物：去边框，使用极淡背景和内阴影 */
          background-color: var(--backgroundSecondary);
          border: 1px solid transparent; 
          box-shadow: inset 0 1px 2px rgba(0,0,0,0.03); 
          
          color: var(--text);
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s ease;
        }

        .SidebarTop__trigger:hover:not(:disabled) {
          background-color: var(--backgroundHover);
          color: var(--text);
        }
        
        .SidebarTop__trigger.active {
           background-color: var(--background);
           border-color: var(--primary-alpha-20);
           box-shadow: 0 0 0 3px var(--primary-alpha-10), 0 2px 8px rgba(0,0,0,0.05);
           color: var(--primary);
        }

        .SidebarTop__trigger:disabled { opacity: 0.6; cursor: not-allowed; }

        .SidebarTop__label {
          flex: 1;
          font-size: 0.9rem;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: left;
        }

        .SidebarTop__chevron {
          color: var(--textTertiary);
          transition: transform 0.3s var(--ease-spring);
          flex-shrink: 0;
          margin-left: 8px;
        }
        
        .SidebarTop__trigger.active .SidebarTop__chevron {
          transform: rotate(180deg);
          color: var(--primary);
        }
        
        .SidebarTop__spinner {
            animation: spin 1s linear infinite;
            color: var(--textTertiary);
        }

        /* === Dropdown Menu === */
        .SidebarTop__menu {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          
          /* 玻璃拟态风格 */
          background-color: var(--background);
          /* 如果支持 backdrop-filter，可以稍微透明一点 */
          @supports (backdrop-filter: blur(10px)) {
             background-color: rgba(255, 255, 255, 0.9);
             backdrop-filter: blur(12px);
          }
          
          border-radius: 12px;
          /* 极细边框 + 深邃阴影 */
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.05), 
            0 10px 15px -3px rgba(0, 0, 0, 0.05),
            0 0 0 1px rgba(0,0,0,0.02);
            
          z-index: ${zIndex.dropdown};
          animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: top center;
          min-width: 200px;
          overflow: hidden;
        }
        
        .dark .SidebarTop__menu {
            background-color: rgba(30, 30, 30, 0.9);
            border-color: rgba(255,255,255,0.08);
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .SidebarTop__content {
          max-height: 300px;
          overflow-y: auto;
          padding: 6px;
        }
        
        /* 滚动条美化 */
        .SidebarTop__content::-webkit-scrollbar { width: 4px; }
        .SidebarTop__content::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 2px; }

        .SidebarTop__loadingItem,
        .SidebarTop__emptyItem {
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: var(--textTertiary);
          font-size: 0.85rem;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};
