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
import { AppRoutePaths } from "app/constants/routePaths";
import { Tooltip } from "render/web/ui/Tooltip";

const DialogMenu = lazy(() => import("./DialogMenu"));
const PageMenu = lazy(() => import("./PageMenu"));
const CreateMenuButton = lazy(() => import("./CreateMenuButton"));
const LanguageSwitcher = lazy(() => import("render/web/ui/LanguageSwitcher"));
const NavListItem = lazy(() => import("render/layout/blocks/NavListItem"));

const TopBar = ({ toggleSidebar }: { toggleSidebar?: () => void }) => {
  const { t } = useTranslation();
  const { isLoggedIn, user } = useAuth();
  const { pageKey } = useParams();
  const [isScrolled, setIsScrolled] = useState(false);

  const currentDialog = useAppSelector(selectCurrentDialogConfig);
  const page = useAppSelector(selectPageData);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const showEdit = useMemo(() => {
    if (!pageKey?.startsWith("page") || !page?.isInitialized) return false;
    const creator = extractUserId(pageKey);
    return creator === user?.userId || !page?.creator;
  }, [pageKey, page, user]);

  const isMac =
    typeof window !== "undefined" && /Mac/.test(window.navigator.platform);

  // 提示内容样式内联，避免污染全局 CSS
  const tooltipContent = (
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
          fontFamily: "monospace",
          color: "var(--textTertiary)",
          lineHeight: 1,
        }}
      >
        {isMac ? "⌘B" : "Ctrl+B"}
      </kbd>
    </div>
  );

  return (
    <>
      <header className={`topbar ${isScrolled ? "topbar--scrolled" : ""}`}>
        {/* 左侧 */}
        <div className="topbar__section topbar__section--left">
          {!isLoggedIn && (
            <Suspense fallback={null}>
              <NavListItem
                label={t("home")}
                icon={<LuHouse size={18} />}
                path="/"
              />
            </Suspense>
          )}
          {toggleSidebar && (
            <Tooltip content={tooltipContent} placement="bottom">
              <button
                className="topbar__icon-btn"
                onClick={toggleSidebar}
                aria-label={t("toggleSidebar")}
              >
                <LuMenu size={18} />
              </button>
            </Tooltip>
          )}
        </div>

        {/* 中间：核心修复区域 */}
        <div className="topbar__center">
          <Suspense fallback={null}>
            {showEdit ? (
              <PageMenu />
            ) : currentDialog ? (
              <DialogMenu currentDialog={currentDialog} />
            ) : null}
          </Suspense>
        </div>

        {/* 右侧 */}
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
                  icon={<LuLogIn size={18} />}
                  path={AppRoutePaths.LOGIN}
                />
              </Suspense>
            </>
          )}
        </div>
      </header>

      <style href="topbar-styles" precedence="default">{`
        .topbar {
          display: grid;
          /* 核心修复：使用 minmax(0, 1fr) 防止 Grid 侧边被无限挤压 */
          grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
          align-items: center;
          background: var(--background);
          position: sticky;
          top: 0;
          padding: 0 var(--space-4);
          z-index: ${zIndex.topbar};
          height: var(--headerHeight);
          border-bottom: 1px solid transparent;
          transition: border-color 0.2s ease;
          gap: var(--space-2);
        }
        .topbar--scrolled { border-bottom-color: var(--border); }

        .topbar__section { display: flex; align-items: center; gap: var(--space-2); }
        .topbar__section--left { justify-content: flex-start; }
        .topbar__section--right { justify-content: flex-end; }

        .topbar__center {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          /* 核心修复：限制最大宽度，强制触发内部文本截断 */
          max-width: 50vw; 
        }

        .topbar__icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--textSecondary);
          width: 32px;
          height: 32px;
          border-radius: 6px;
          transition: all 0.15s ease;
        }
        .topbar__icon-btn:hover { background: var(--backgroundHover); color: var(--text); }

        @media (max-width: 768px) {
          .topbar {
            grid-template-columns: auto 1fr auto; /* 移动端中间自适应 */
            padding: 0 var(--space-2);
          }
          .topbar__center {
            justify-content: flex-start; /* 移动端靠左 */
            max-width: 100%; /* 取消宽度限制 */
            overflow: hidden;
          }
        }
      `}</style>
    </>
  );
};

export default TopBar;
