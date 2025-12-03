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
        {/* Home 按钮 */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `SidebarTop__homeButton ${isActive ? "active" : ""}`
          }
          title={t("home")}
          aria-label={t("home")}
        >
          <LuHouse size={18} strokeWidth={2.5} />
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
           /* 局部变量 */
           --st-height: 56px;
           --st-ease: cubic-bezier(0.2, 0, 0.2, 1);
        }

        .SidebarTop {
          display: flex;
          align-items: center;
          gap: var(--space-3); /* 使用空间系统 12px */
          padding: 0 var(--space-4); /* 使用空间系统 16px */
          height: var(--st-height);
          flex-shrink: 0;
          position: relative;
          z-index: 10;
        }

        /* === Home Button === */
        /* 采用圆形设计，悬停时微弱背景，选中时强调色 */
        .SidebarTop__homeButton {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px; /* 固定尺寸，保持精致 */
          height: 36px;
          flex-shrink: 0;
          border-radius: 50%;
          
          color: var(--textTertiary);
          background: transparent;
          border: 1px solid transparent;
          
          transition: all 0.2s var(--st-ease);
          cursor: pointer;
        }

        .SidebarTop__homeButton:hover {
          color: var(--text);
          background: var(--backgroundHover);
        }

        .SidebarTop__homeButton.active {
          color: var(--primary);
          background: var(--primaryGhost);
          /* 40% 拟物：微弱的彩色光晕 */
          box-shadow: 0 0 0 1px var(--primary-alpha-10), 0 2px 6px -2px rgba(var(--primary-rgb), 0.3);
        }

        /* === Dropdown Wrapper === */
        .SidebarTop__dropdownWrapper {
          flex: 1;
          position: relative;
          min-width: 0; 
        }

        /* === Trigger Button === */
        /* 介于扁平与拟物之间：有背景，无明显线框，强调层次 */
        .SidebarTop__trigger {
          display: flex;
          align-items: center;
          width: 100%;
          height: 36px;
          padding: 0 var(--space-3);
          border-radius: 8px; /* 适中的圆角 */
          
          /* 核心样式：使用变量 */
          background-color: var(--backgroundSecondary);
          border: 1px solid transparent; 
          color: var(--text);
          
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s var(--st-ease);
          user-select: none;
        }

        /* 悬停态 */
        .SidebarTop__trigger:hover:not(:disabled) {
          background-color: var(--backgroundHover);
          color: var(--text);
          /* 细微的边框感知 */
          border-color: var(--borderHover);
        }
        
        /* 激活态（菜单打开时） */
        .SidebarTop__trigger.active {
           background-color: var(--background); /* 凸起感，变亮 */
           color: var(--primary);
           border-color: var(--primary);
           /* 聚焦光环 */
           box-shadow: 0 0 0 3px var(--focus);
        }

        .SidebarTop__trigger:disabled { 
            opacity: 0.6; 
            cursor: not-allowed; 
        }

        .SidebarTop__label {
          flex: 1;
          font-size: 0.875rem; /* 14px */
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: left;
          letter-spacing: 0.01em; /* 增加一点呼吸感 */
        }

        .SidebarTop__chevron {
          color: var(--textTertiary);
          transition: transform 0.3s var(--st-ease);
          flex-shrink: 0;
          margin-left: var(--space-2);
        }
        
        .SidebarTop__trigger.active .SidebarTop__chevron {
          transform: rotate(180deg);
          color: var(--primary);
        }
        
        .SidebarTop__spinner {
            animation: spin 1s linear infinite;
            color: var(--textTertiary);
        }

        /* === Dropdown Menu (Liquid Glass) === */
        .SidebarTop__menu {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          
          /* Liquid Glass 效果核心 */
          background-color: var(--backgroundGhost); /* 使用带透明度的变量 */
          backdrop-filter: blur(12px); /* 磨砂玻璃 */
          -webkit-backdrop-filter: blur(12px);
          
          border-radius: 12px;
          border: 1px solid var(--border);
          
          /* 深度阴影 */
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.02),
            0 12px 32px var(--shadowHeavy);
            
          z-index: ${zIndex.dropdown};
          animation: st-slideDown 0.2s var(--st-ease);
          transform-origin: top center;
          min-width: 220px;
          overflow: hidden;
        }

        .SidebarTop__content {
          max-height: 320px;
          overflow-y: auto;
          padding: var(--space-2);
        }
        
        /* 滚动条隐藏与美化 */
        .SidebarTop__content::-webkit-scrollbar { width: 4px; }
        .SidebarTop__content::-webkit-scrollbar-track { background: transparent; }
        .SidebarTop__content::-webkit-scrollbar-thumb { 
            background: var(--border); 
            border-radius: 2px; 
        }
        .SidebarTop__content::-webkit-scrollbar-thumb:hover { background: var(--textTertiary); }

        .SidebarTop__loadingItem,
        .SidebarTop__emptyItem {
          padding: var(--space-4);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          color: var(--textTertiary);
          font-size: 0.85rem;
        }

        @keyframes st-slideDown {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};
