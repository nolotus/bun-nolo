// 文件路径: render/layout/MainLayout.tsx
import { useAuth } from "auth/hooks/useAuth";
import ChatSidebar from "chat/web/ChatSidebar";
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
import { useAppSelector } from "app/store";
import { zIndex } from "render/styles/zIndex";
import { setSidebarWidth, selectSidebarWidth } from "app/settings/settingSlice";
import { SidebarTop } from "./SidebarTop";
import LifeSidebarContent from "life/LifeSidebarContent";
import PageContentErrorBoundary from "./PageContentErrorBoundary";
import SidebarBottom from "./SidebarBottom";

const TopBar = lazy(() => import("./TopBar"));

const MIN_WIDTH = 200;
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
    const newWidth = sidebarWidth > 0 ? 0 : lastWidthRef.current || 260;
    dispatch(setSidebarWidth(newWidth));
  }, [dispatch, sidebarWidth]);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    requestAnimationFrame(() => {
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX));
      if (sidebarRef.current) sidebarRef.current.style.width = `${newWidth}px`;
    });
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const stopResizing = () => {
      if (sidebarRef.current) {
        const finalWidth = parseInt(sidebarRef.current.style.width, 10);
        sidebarRef.current.style.width = "";
        if (!isNaN(finalWidth)) dispatch(setSidebarWidth(finalWidth));
      }
      setIsResizing(false);
    };

    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    window.addEventListener("mouseleave", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      window.removeEventListener("mouseleave", stopResizing);
    };
  }, [isResizing, dispatch, resize]);

  // 客户端：媒体查询 + 快捷键
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    const setMobile = () => setIsMobile(mql.matches);
    setMobile();

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b" && hasSidebar) {
        e.preventDefault();
        toggleSidebar();
      }
    };

    mql.addEventListener("change", setMobile);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      mql.removeEventListener("change", setMobile);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleSidebar, hasSidebar]);

  // 首次在移动端进入时自动收起
  useEffect(() => {
    if (isInitialMount.current) {
      if (isMobile && isOpen) dispatch(setSidebarWidth(0));
      isInitialMount.current = false;
    }
  }, [isMobile, isOpen, dispatch]);

  // 移动端侧边栏打开时锁定滚动
  useEffect(() => {
    document.body.style.overflow =
      isOpen && isMobile && hasSidebar ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, isMobile, hasSidebar]);

  return (
    <>
      <div className={`MainLayout ${isResizing ? "is-resizing" : ""}`}>
        {hasSidebar && (
          <aside
            ref={sidebarRef}
            className={`MainLayout__sidebar ${isOpen ? "is-open" : "is-closed"}`}
            style={{ width: isMobile ? "85%" : sidebarWidth }}
          >
            {isLoggedIn && <SidebarTop />}
            <div className="MainLayout__sidebarContent">{sidebarContent}</div>
            {isLoggedIn && <SidebarBottom />}
            {!isMobile && (
              <div
                className="MainLayout__resizeHandle"
                onMouseDown={startResizing}
              />
            )}
          </aside>
        )}

        {hasSidebar && isOpen && isMobile && (
          <div className="MainLayout__backdrop" onClick={toggleSidebar} />
        )}

        <main className="MainLayout__main">
          <Suspense fallback={<div style={{ height: 52 }} />}>
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
        .MainLayout {
          display: flex;
          min-height: 100dvh;
          background: var(--background);
        }
        .MainLayout.is-resizing { cursor: col-resize; user-select: none; }
        .MainLayout.is-resizing .MainLayout__sidebar,
        .MainLayout.is-resizing .MainLayout__main { transition: none !important; }

        .MainLayout__sidebar {
          height: 100dvh;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          position: relative;
          z-index: ${zIndex.sidebar};
          overflow: hidden;
          transition: width 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          background: var(--background);
          border-right: 1px solid var(--border);
        }

        .MainLayout__sidebarContent {
          flex: 1;
          min-width: ${MIN_WIDTH}px;
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: thin;
          scrollbar-color: var(--textQuaternary) transparent;
        }
        .MainLayout__sidebarContent::-webkit-scrollbar { width: 6px; }
        .MainLayout__sidebarContent::-webkit-scrollbar-track { background: transparent; }
        .MainLayout__sidebarContent::-webkit-scrollbar-thumb {
          background: var(--textQuaternary); border-radius: 3px;
        }

        .MainLayout__main {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100dvh;
          min-width: 0;
          overflow: hidden;
          background: var(--backgroundSecondary);
        }
        .MainLayout__pageContent { flex: 1; overflow: auto; }

        .MainLayout__resizeHandle {
          position: absolute; top: 0; right: -3px;
          width: 6px; height: 100%;
          cursor: col-resize; z-index: ${zIndex.sidebarResizeHandle};
          display: flex; justify-content: center;
        }
        .MainLayout__resizeHandle::after {
          content: ''; width: 1px; height: 100%;
          background: transparent; transition: background-color 0.2s ease;
        }
        .MainLayout__resizeHandle:hover::after,
        .MainLayout.is-resizing .MainLayout__resizeHandle::after { background: var(--primary); }

        .MainLayout__backdrop {
          position: fixed; inset: 0;
          background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(4px);
          z-index: ${zIndex.sidebarBackdrop};
          animation: fadeIn 0.24s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        @media (max-width: 768px) {
          .MainLayout__sidebar {
            position: fixed;
            width: 85% !important;
            max-width: 320px;
            box-shadow: var(--shadowHeavy);
            transform: translateX(-100%);
            border-right: none;
            transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .MainLayout__sidebar.is-open { transform: translateX(0); }
          .MainLayout__resizeHandle { display: none; }
        }
      `}</style>
    </>
  );
};

export default MainLayout;
