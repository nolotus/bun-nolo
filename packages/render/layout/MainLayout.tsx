import { useAuth } from "auth/hooks/useAuth";
import ChatSidebar from "chat/ChatSidebar";
import LifeSidebarContent from "life/LifeSidebarContent";
import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { zIndex } from "render/styles/zIndex";
import { SidebarTop } from "./SidebarTop";
import TopBar from "./TopBar";
import {
  selectTheme,
  selectHeaderHeight,
  setSidebarWidth,
  selectSidebarWidth,
} from "app/settings/settingSlice";

const MainLayout: React.FC = () => {
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);
  const headerHeight = useSelector(selectHeaderHeight);
  const sidebarWidth = useSelector(selectSidebarWidth);
  const isOpen = sidebarWidth > 0;

  const [isResizing, setIsResizing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const lastWidthRef = useRef(sidebarWidth);

  useEffect(() => {
    if (sidebarWidth > 0) {
      lastWidthRef.current = sidebarWidth;
    }
  }, [sidebarWidth]);

  let sidebarContent;
  if (location.pathname.startsWith("/life")) {
    sidebarContent = <LifeSidebarContent />;
  } else if (isLoggedIn) {
    sidebarContent = <ChatSidebar />;
  } else {
    sidebarContent = null;
  }

  // 判断侧边栏是否应该显示并占用空间
  const hasSidebar = sidebarContent !== null;
  const sidebarShouldTakeSpace = hasSidebar && isOpen && !isMobile;

  const toggleSidebar = useCallback(() => {
    const newWidth = sidebarWidth > 0 ? 0 : lastWidthRef.current || 260;
    dispatch(setSidebarWidth(newWidth));
  }, [dispatch, sidebarWidth]);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;
      requestAnimationFrame(() => {
        const newWidth = e.clientX;
        if (newWidth >= 200 && newWidth <= 600) {
          dispatch(setSidebarWidth(newWidth));
        }
      });
    },
    [isResizing, dispatch]
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        if (hasSidebar) {
          toggleSidebar();
        }
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleSidebar, hasSidebar]);

  useEffect(() => {
    if (!isResizing) return;
    const stopResizing = () => setIsResizing(false);
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, isResizing]);

  useEffect(() => {
    document.body.style.overflow =
      isOpen && isMobile && hasSidebar ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, isMobile, hasSidebar]);

  return (
    <>
      <div className="MainLayout">
        {hasSidebar && (
          <>
            {isOpen && isMobile && (
              <div className="MainLayout__backdrop" onClick={toggleSidebar} />
            )}

            <aside
              ref={sidebarRef}
              className={`
                MainLayout__sidebar 
                ${isOpen ? "is-open" : "is-closed"}
                ${isResizing ? "is-resizing" : ""}
              `}
              style={{ width: isMobile ? "85%" : sidebarWidth }}
            >
              {isLoggedIn && <SidebarTop />}
              <div className="MainLayout__sidebarContent">{sidebarContent}</div>

              {!isMobile && (
                <div
                  className="MainLayout__resizeHandle"
                  onMouseDown={startResizing}
                />
              )}
            </aside>
          </>
        )}

        <main
          className={`
            MainLayout__main
            ${sidebarShouldTakeSpace ? "has-sidebar" : ""}
            ${isResizing ? "is-resizing" : ""}
          `}
          style={{
            marginLeft: sidebarShouldTakeSpace ? sidebarWidth : 0,
          }}
        >
          <TopBar toggleSidebar={hasSidebar ? toggleSidebar : undefined} />
          <div className="MainLayout__pageContent">
            <Suspense fallback={<div>main Loading...</div>}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>

      <style href="MainLayout-styles" precedence="component">{`
        .MainLayout {
          display: flex;
          min-height: 100vh;
          background: var(--background);
          position: relative;
        }

        .MainLayout__sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          z-index: ${zIndex.sidebar};
          display: flex;
          flex-direction: column;
          background: var(--backgroundSecondary);
          box-shadow: var(--shadowMedium);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translateX(-100%);
          will-change: transform;
        }

        .MainLayout__sidebar.is-open {
          transform: translateX(0);
        }

        .MainLayout__sidebar.is-resizing,
        .MainLayout__main.is-resizing {
          transition: none !important;
        }

        .MainLayout__sidebarContent {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .MainLayout__main {
          flex: 1;
          transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
        }

        .MainLayout__pageContent {
          width: 100%;
          position: relative;
        }

        .MainLayout__resizeHandle {
          position: absolute;
          top: 0;
          right: -2px;
          width: 4px;
          height: 100%;
          cursor: col-resize;
          z-index: ${zIndex.sidebarResizeHandle};
        }
        
        .MainLayout__backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(2px);
          z-index: ${zIndex.sidebarBackdrop};
        }

        /* 移动端样式覆盖 */
        @media (max-width: 768px) {
          .MainLayout__sidebar {
            width: 85% !important;
            max-width: 320px;
            box-shadow: var(--shadowHeavy);
          }
          
          .MainLayout__sidebar.is-closed {
            overflow: hidden;
          }
          
          .MainLayout__resizeHandle {
            display: none;
          }

          .MainLayout__main {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </>
  );
};

export default MainLayout;
