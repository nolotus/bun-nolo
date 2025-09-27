// File: TopBar.jsx (Complete Code)

import React, { useState, useEffect, Suspense, lazy } from "react";
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
import NavListItem from "render/layout/blocks/NavListItem";
import LanguageSwitcher from "render/web/ui/LanguageSwitcher";
import { Tooltip } from "render/web/ui/Tooltip";

// 懒加载组件
import DialogMenu from "./DialogMenu";
import PageMenu from "./PageMenu";
const CreateMenuButton = lazy(() => import("./CreateMenuButton"));

const TopBar = ({ toggleSidebar }: { toggleSidebar?: () => void }) => {
  const { t } = useTranslation();
  const { isLoggedIn, user } = useAuth();
  const { pageKey } = useParams();

  // Redux 选择器
  const currentDialog = useAppSelector(selectCurrentDialogConfig);
  const page = useAppSelector(selectPageData);

  // 本地状态
  const [isScrolled, setIsScrolled] = useState(false);

  // 检测页面滚动
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 判断当前用户是否可以编辑页面
  const creator = pageKey ? extractUserId(pageKey) : null;
  const isCreator = creator === user?.userId;
  const canEdit = isCreator || !page.creator;
  const showEdit = pageKey?.startsWith("page") && canEdit && page.isInitialized;

  // 动态生成 Tooltip 内容，适配不同操作系统
  const isMac =
    typeof window !== "undefined" &&
    /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);

  const sidebarToggleTooltipContent = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-2)",
      }}
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
          lineHeight: "1",
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
            <NavListItem
              label={t("home")}
              icon={<LuHouse size={16} />}
              path="/"
            />
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
          {currentDialog && !showEdit ? (
            <DialogMenu currentDialog={currentDialog} />
          ) : showEdit ? (
            <PageMenu />
          ) : null}
        </div>

        <div className="topbar__section topbar__section--right">
          {isLoggedIn ? (
            <>
              <Suspense fallback={<div style={{ width: 24 }} />}>
                <CreateMenuButton />
              </Suspense>
            </>
          ) : (
            <>
              <LanguageSwitcher />
              <NavListItem
                label={t("login")}
                icon={<LuLogIn size={16} />}
                path={RoutePaths.LOGIN}
              />
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
        .topbar--scrolled {
            border-bottom-color: var(--border);
        }
        .topbar__section {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .topbar__section--left {
            justify-content: flex-start;
        }
        .topbar__section--right {
            justify-content: flex-end;
        }
        .topbar__center {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          min-width: 0; /* Prevents long titles from pushing layout */
        }
        .topbar__actions {
          display: flex;
          align-items: center;
          gap: var(--space-3);
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
        .topbar__button:hover {
          background: var(--backgroundHover);
          color: var(--text);
        }
        .topbar__button:disabled {
          opacity: .5;
          cursor: not-allowed;
        }
        .topbar__button--delete:hover {
          background: var(--primaryGhost);
          color: var(--error);
        }
        .topbar__button--mobile {
          width: 100% !important;
          justify-content: flex-start !important;
          gap: var(--space-3) !important;
          padding: var(--space-3) !important;
          height: auto !important;
          font-size: 14px;
          font-weight: 400;
        }
        .topbar__spinner {
          width: 16px;
          height: 16px;
          border: 2px solid var(--borderLight);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin .8s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
        .topbar__mobile-menu {
          position: relative;
          display: none;
        }
        .topbar__backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: ${zIndex.topbarMenuBackdrop};
          background: transparent;
        }
        .topbar__dropdown {
          position: absolute;
          top: calc(100% + var(--space-2));
          right: 0;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 8px;
          min-width: 240px;
          padding: var(--space-2);
          z-index: ${zIndex.topbarMenu};
          box-shadow: var(--shadowHeavy);
        }
        .topbar__menu-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          margin-bottom: var(--space-2);
          padding-bottom: var(--space-2);
          border-bottom: 1px solid var(--borderLight);
        }
        .topbar__menu-section:last-child {
          margin: 0;
          padding: 0;
          border: none;
        }
        @media (max-width: 768px) {
          .topbar {
            grid-template-columns: auto 1fr auto;
            padding: 0 var(--space-2);
            gap: var(--space-2);
          }
          .topbar__center {
            justify-content: center;
          }
          .topbar__title {
            font-size: 15px;
            max-width: calc(100vw - 200px);
          }
          .topbar__actions {
            display: none !important;
          }
          .topbar__mobile-menu {
            display: flex;
            align-items: center;
            gap: var(--space-2);
          }
        }
        @media (max-width: 480px) {
          .topbar__title {
            font-size: 14px;
          }
        }
      `}</style>
    </>
  );
};

export default TopBar;
