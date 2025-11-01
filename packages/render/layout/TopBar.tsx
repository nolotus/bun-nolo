// File: TopBar.jsx

import React, { useState, useEffect, Suspense, lazy, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { LuLogIn, LuMenu, LuHouse } from "react-icons/lu";
import { useAppSelector } from "app/store";
import { useAuth } from "auth/hooks/useAuth";
import { selectPageData } from "render/page/pageSlice";
import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";
import { extractUserId } from "core/prefix";
import { zIndex } from "render/styles/zIndex";
import { RoutePaths } from "auth/web/routes";
import { Tooltip } from "render/web/ui/Tooltip";

// 懒加载
const DialogMenu = lazy(() => import("./DialogMenu"));
const PageMenu = lazy(() => import("./PageMenu"));
const CreateMenuButton = lazy(() => import("./CreateMenuButton"));
const LanguageSwitcher = lazy(() => import("render/web/ui/LanguageSwitcher"));
const NavListItem = lazy(() => import("render/layout/blocks/NavListItem"));

const TopBar = ({ toggleSidebar }: { toggleSidebar?: () => void }) => {
  const { t } = useTranslation();
  const { isLoggedIn, user } = useAuth();
  const { pageKey } = useParams();

  const currentDialog = useAppSelector(selectCurrentDialogConfig);
  const page = useAppSelector(selectPageData);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 是否显示页面编辑菜单（与原逻辑一致）
  const showEdit = useMemo(() => {
    const isPage = !!pageKey && pageKey.startsWith("page");
    if (!isPage || !page?.isInitialized) return false;
    const creator = extractUserId(pageKey);
    const isCreator = creator === user?.userId;
    return isCreator || !page?.creator;
  }, [pageKey, page?.isInitialized, page?.creator, user?.userId]);

  // 动态快捷键提示
  const isMac =
    typeof window !== "undefined" &&
    /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);

  const sidebarToggleTooltipContent = (
    <div
      style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}
    >
      <span>{t("toggleSidebar")}</span>
      <kbd
        style={{
          background: "var(--background)",
          border: "1px solid var(--border)",
          padding: "2px 6px",
          borderRadius: "4px",
          fontSize: "11px",
          color: "var(--textTertiary)",
          fontFamily: "sans-serif",
          lineHeight: 1,
        }}
      >
        {isMac ? "⌘" : "Ctrl"} + B
      </kbd>
    </div>
  );

  return (
    <>
      <div className={`topbar ${isScrolled ? "topbar--scrolled" : ""}`}>
        <div className="topbar__section topbar__section--left">
          {!isLoggedIn && (
            <Suspense fallback={null}>
              <NavListItem
                label={t("home")}
                icon={<LuHouse size={16} />}
                path="/"
              />
            </Suspense>
          )}

          {toggleSidebar && (
            <Tooltip content={sidebarToggleTooltipContent} placement="bottom">
              <button
                className="topbar__button"
                onClick={toggleSidebar}
                aria-label={t("toggleSidebar")}
              >
                <LuMenu size={16} />
              </button>
            </Tooltip>
          )}
        </div>

        <div className="topbar__center">
          <Suspense fallback={null}>
            {showEdit ? (
              <PageMenu />
            ) : currentDialog ? (
              <DialogMenu currentDialog={currentDialog} />
            ) : null}
          </Suspense>
        </div>

        <div className="topbar__section topbar__section--right">
          {isLoggedIn ? (
            <Suspense fallback={<div style={{ width: 24 }} />}>
              <CreateMenuButton />
            </Suspense>
          ) : (
            <>
              <Suspense fallback={null}>
                <LanguageSwitcher />
              </Suspense>
              <Suspense fallback={null}>
                <NavListItem
                  label={t("login")}
                  icon={<LuLogIn size={16} />}
                  path={RoutePaths.LOGIN}
                />
              </Suspense>
            </>
          )}
        </div>
      </div>

      <style href="topbar-styles" precedence="default">{`
        .topbar {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          background: var(--background);
          position: sticky;
          top: 0;
          padding: 0 var(--space-4);
          z-index: ${zIndex.topbar};
          height: var(--headerHeight);
          border-bottom: 1px solid transparent;
          transition: border-color 0.2s ease-in-out;
          gap: var(--space-4);
        }
        .topbar--scrolled { border-bottom-color: var(--border); }

        .topbar__section { display: flex; align-items: center; gap: var(--space-2); }
        .topbar__section--left { justify-content: flex-start; }
        .topbar__section--right { justify-content: flex-end; }

        .topbar__center {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          min-width: 0; /* 防止长标题挤压布局 */
        }

        .topbar__title {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .topbar__button {
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--textSecondary);
          width: var(--space-8);
          height: var(--space-8);
          border-radius: 6px;
          transition: all .15s ease;
          flex-shrink: 0;
        }
        .topbar__button:hover { background: var(--backgroundHover); color: var(--text); }
        .topbar__button:disabled { opacity: .5; cursor: not-allowed; }
        .topbar__button--delete:hover { background: var(--primaryGhost); color: var(--error); }

        /* 桌面/移动 操作区切换（供 PageMenu 内部使用） */
        .topbar__actions {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        .topbar__mobile-menu {
          position: relative;
          display: none; /* 默认隐藏移动版 */
        }

        @media (max-width: 768px) {
          .topbar {
            grid-template-columns: auto 1fr auto;
            padding: 0 var(--space-2);
            gap: var(--space-2);
          }
          .topbar__center { justify-content: center; }
          .topbar__title { font-size: 15px; max-width: calc(100vw - 200px); }

          .topbar__actions { display: none !important; }   /* 移动端隐藏桌面版操作区 */
          .topbar__mobile-menu {
            display: flex;                                  /* 移动端显示移动版操作区 */
            align-items: center;
            gap: var(--space-2);
          }
        }

        @media (max-width: 480px) {
          .topbar__title { font-size: 14px; }
        }
      `}</style>
    </>
  );
};

export default TopBar;
