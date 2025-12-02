// 文件路径: render/layout/MainLayout.tsx
import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  lazy,
} from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useAuth } from "auth/hooks/useAuth";
import { useAppSelector } from "app/store";
import { setSidebarWidth, selectSidebarWidth } from "app/settings/settingSlice";
import { zIndex } from "render/styles/zIndex";
import ChatSidebar from "chat/web/ChatSidebar";
import LifeSidebarContent from "life/LifeSidebarContent";
import { SidebarTop } from "./SidebarTop";
import SidebarBottom from "./SidebarBottom";
import PageContentErrorBoundary from "./PageContentErrorBoundary";

const TopBar = lazy(() => import("./TopBar"));

const MIN_WIDTH = 240; // 稍微加宽最小宽度，保证内容呼吸感
const MAX_WIDTH = 600;

const MainLayout: React.FC = () => {
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const dispatch = useDispatch();
  const sidebarWidth = useAppSelector(selectSidebarWidth);
  const isOpen = sidebarWidth > 0;

  const [isResizing, setIsResizing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const sidebarRef = useRef<HTMLElement>(null);
  const lastWidthRef = useRef(sidebarWidth);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (sidebarWidth > 0) lastWidthRef.current = sidebarWidth;
  }, [sidebarWidth]);

  const sidebarContent = location.pathname.startsWith("/life") ? (
    <LifeSidebarContent />
  ) : isLoggedIn ? (
    <ChatSidebar />
  ) : null;

  const hasSidebar = sidebarContent !== null;

  const toggleSidebar = useCallback(() => {
    const newWidth = sidebarWidth > 0 ? 0 : lastWidthRef.current || 280;
    dispatch(setSidebarWidth(newWidth));
  }, [dispatch, sidebarWidth]);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    requestAnimationFrame(() => {
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX));
      if (sidebarRef.current) {
        sidebarRef.current.style.width = `${newWidth}px`;
      }
    });
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";

    if (sidebarRef.current) {
      const finalWidth = parseInt(sidebarRef.current.style.width, 10);
      if (!isNaN(finalWidth) && !isMobile) {
        dispatch(setSidebarWidth(finalWidth));
      }
      sidebarRef.current.style.width = "";
    }
  }, [dispatch, isMobile]);

  useEffect(() => {
    if (!isResizing) return;
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    window.addEventListener("mouseleave", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      window.removeEventListener("mouseleave", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  // 媒体查询与快捷键
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    const updateMobile = () => setIsMobile(mql.matches);
    updateMobile();

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b" && hasSidebar) {
        e.preventDefault();
        toggleSidebar();
      }
    };

    mql.addEventListener("change", updateMobile);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      mql.removeEventListener("change", updateMobile);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleSidebar, hasSidebar]);

  useEffect(() => {
    if (isInitialMount.current) {
      if (isMobile && isOpen) dispatch(setSidebarWidth(0));
      isInitialMount.current = false;
    }
  }, [isMobile, isOpen, dispatch]);

  return (
    <>
      <div className={`MainLayout ${isResizing ? "is-resizing" : ""}`}>
        {hasSidebar && (
          <>
            <div
              className={`MainLayout__backdrop ${isOpen && isMobile ? "is-visible" : ""}`}
              onClick={toggleSidebar}
            />

            <aside
              ref={sidebarRef}
              className={`MainLayout__sidebar ${isOpen ? "is-open" : "is-closed"} ${isMobile ? "is-mobile" : ""}`}
              style={!isMobile && isOpen ? { width: sidebarWidth } : undefined}
            >
              <div className="MainLayout__sidebarInner">
                {isLoggedIn && <SidebarTop />}
                <div className="MainLayout__sidebarContent">
                  {sidebarContent}
                </div>
                {isLoggedIn && <SidebarBottom />}
              </div>

              {/* 视觉上的极细分割线，兼具拖拽功能 */}
              {!isMobile && isOpen && (
                <div
                  className="MainLayout__resizeHandle"
                  onMouseDown={startResizing}
                >
                  <div className="MainLayout__resizeLine" />
                </div>
              )}
            </aside>
          </>
        )}

        <main className="MainLayout__main">
          <Suspense fallback={<div style={{ height: 52 }} />}>
            {/* TopBar 可以考虑做成悬浮效果，增加拟物感 */}
            <TopBar toggleSidebar={hasSidebar ? toggleSidebar : undefined} />
          </Suspense>
          <div className="MainLayout__pageContent">
            <PageContentErrorBoundary>
              <Suspense fallback={<div>Loading...</div>}>
                <Outlet />
              </Suspense>
            </PageContentErrorBoundary>
          </div>
        </main>
      </div>

      <style href="MainLayout-styles" precedence="default">{`
        :root {
          /* 使用 CSS 变量以符合设计要求 */
          --sidebar-bg: var(--background, #ffffff);
          --main-bg: var(--backgroundSecondary, #f9fafb);
          /* 40% 拟物：使用柔和阴影代替硬边框 */
          --sidebar-shadow: 4px 0 24px rgba(0, 0, 0, 0.04); 
          --resize-active: var(--primary, #3b82f6);
          --text-subtle: var(--textQuaternary, #9ca3af);
        }

        .MainLayout {
          display: flex;
          height: 100dvh;
          width: 100vw;
          overflow: hidden;
          background: var(--main-bg);
          font-family: inherit; /* 继承全局字体设置 */
        }

        /* ---------------- Sidebar (区域划分：减少边框) ---------------- */
        .MainLayout__sidebar {
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          position: relative;
          z-index: ${zIndex.sidebar};
          height: 100%;
          background: var(--sidebar-bg);
          
          /* 移除 border-right，改用阴影体现层次（拟物感） */
          /* border-right: 1px solid ... (已移除) */
          box-shadow: var(--sidebar-shadow); 
          
          width: 0;
          transition: width 0.3s cubic-bezier(0.2, 0, 0, 1), transform 0.3s cubic-bezier(0.2, 0, 0, 1);
          will-change: width, transform;
        }

        .MainLayout.is-resizing .MainLayout__sidebar {
          transition: none !important;
        }

        .MainLayout__sidebarInner {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
          overflow: hidden;
        }

        /* 内容区域：增加呼吸感 */
        .MainLayout__sidebarContent {
          flex: 1;
          overflow-y: overlay; /* 现代浏览器覆盖式滚动条 */
          overflow-x: hidden;
          /* 设计要求：相关的应该放到一起，利用Padding增加内部呼吸感 */
          padding-bottom: 16px; 
        }

        /* ---------------- Scrollbar (纤细的感觉) ---------------- */
        .MainLayout__sidebarContent::-webkit-scrollbar { width: 4px; } /* 极细 */
        .MainLayout__sidebarContent::-webkit-scrollbar-track { background: transparent; }
        .MainLayout__sidebarContent::-webkit-scrollbar-thumb {
          background-color: transparent;
          border-radius: 4px;
        }
        /* 只有悬停时才显示滚动条，保持界面“清爽、干净” */
        .MainLayout__sidebarContent:hover::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.1);
        }

        /* ---------------- Resize Handle (纤细、克制) ---------------- */
        .MainLayout__resizeHandle {
          position: absolute;
          top: 0; right: -6px; bottom: 0;
          width: 12px;
          cursor: col-resize;
          z-index: ${zIndex.sidebarResizeHandle};
          display: flex;
          justify-content: center;
          align-items: center;
          /* 交互反馈 */
          transition: opacity 0.3s ease;
        }

        /* 视觉线：纤细 */
        .MainLayout__resizeLine {
          width: 1px; /* 极细线条 */
          height: 100%;
          background: transparent;
          transition: background-color 0.2s ease, width 0.2s ease;
        }

        /* Hover 时给予明确但克制的反馈 */
        .MainLayout__resizeHandle:hover .MainLayout__resizeLine,
        .MainLayout.is-resizing .MainLayout__resizeLine {
          background: var(--resize-active);
          opacity: 0.6;
          box-shadow: 0 0 8px var(--resize-active); /* 发光效果，增加一点拟物感 */
        }

        /* ---------------- Main Content ---------------- */
        .MainLayout__main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          height: 100%;
          background: var(--main-bg);
          position: relative;
          /* 侧边栏的阴影需要投射到这里，所以 z-index 略低 */
          z-index: 0; 
        }

        .MainLayout__pageContent {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          /* 如果页面内容需要卡片感，可以在这里加 padding，但通常由 Page 内部控制 */
        }

        /* ---------------- Mobile (交互顺滑) ---------------- */
        @media (max-width: 768px) {
          .MainLayout__sidebar.is-mobile {
            position: fixed;
            top: 0; left: 0; bottom: 0;
            width: 85% !important;
            max-width: 320px;
            /* 移动端更强的阴影，模拟抽屉浮层 */
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
            transform: translateX(-100%);
            transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1); /* iOS 风格缓动 */
            border-right: none;
          }

          .MainLayout__sidebar.is-mobile.is-open {
            transform: translateX(0);
          }
          
          .MainLayout__resizeHandle { display: none; }
        }

        /* ---------------- Backdrop (操作愉悦感) ---------------- */
        .MainLayout__backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.2);
          /* 增加模糊，提升视觉层级聚焦 */
          backdrop-filter: blur(4px); 
          z-index: ${zIndex.sidebarBackdrop};
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.4s cubic-bezier(0.33, 1, 0.68, 1);
        }

        .MainLayout__backdrop.is-visible {
          opacity: 1;
          pointer-events: auto;
        }
      `}</style>
    </>
  );
};

export default MainLayout;
