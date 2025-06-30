// MainLayout.tsx
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
} from "app/settings/settingSlice";

const MainLayout: React.FC = () => {
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);
  const headerHeight = useSelector(selectHeaderHeight);

  const [isOpen, setIsOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isHandleHovered, setIsHandleHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  let sidebarContent;

  if (location.pathname.startsWith("/life")) {
    sidebarContent = <LifeSidebarContent />;
  } else if (isLoggedIn) {
    sidebarContent = <ChatSidebar />;
  } else {
    sidebarContent = null;
  }

  const toggleSidebar = useCallback((e?: React.MouseEvent) => {
    setIsHandleHovered(false);
    setIsOpen((prev) => !prev);
    e?.stopPropagation();
  }, []);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !sidebarRef.current) return;

      requestAnimationFrame(() => {
        const newWidth = Math.round(
          e.clientX - sidebarRef.current!.getBoundingClientRect().left
        );
        if (newWidth >= 200 && newWidth <= 600) {
          dispatch(setSidebarWidth(newWidth));
          if (sidebarRef.current) {
            sidebarRef.current.style.width = `${newWidth}px`;
          }
        }
      });
    },
    [isResizing, dispatch]
  );

  // 统一处理窗口事件
  useEffect(() => {
    if (!sidebarContent) return;

    const handleResize = () => {
      const isDesktop = window.innerWidth >= 768;
      setIsMobile(!isDesktop);
      setIsOpen(isDesktop);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleSidebar, sidebarContent]);

  // 处理拖拽调整
  useEffect(() => {
    if (!isResizing) return;

    const stopResizing = () => setIsResizing(false);

    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    document.body.classList.add("no-select-cursor");

    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      document.body.classList.remove("no-select-cursor");
    };
  }, [resize, isResizing]);

  // 移动端滚动控制
  useEffect(() => {
    if (isOpen && sidebarContent && isMobile) {
      document.body.classList.add("no-scroll");
      return () => document.body.classList.remove("no-scroll");
    }
  }, [isOpen, sidebarContent, isMobile]);

  return (
    <>
      <div className="sidebar-layout">
        {sidebarContent && (
          <>
            <aside
              ref={sidebarRef}
              className={`sidebar ${isOpen ? "open" : "closed"} ${isResizing ? "resizing" : ""}`}
              style={{ width: theme.sidebarWidth }}
            >
              {isLoggedIn && <SidebarTop />}
              <div className="sidebar-content">{sidebarContent}</div>
            </aside>

            {/* 桌面端调整手柄 */}
            {isOpen && !isMobile && (
              <div
                className="resize-handle"
                style={{ left: `calc(${theme.sidebarWidth}px - 5px)` }}
                onMouseEnter={() => setIsHandleHovered(true)}
                onMouseLeave={() => setIsHandleHovered(false)}
              >
                <div className="resize-area" onMouseDown={startResizing} />
              </div>
            )}

            {/* 移动端遮罩 */}
            {isOpen && isMobile && (
              <div className="sidebar-backdrop" onClick={toggleSidebar} />
            )}
          </>
        )}

        <main
          className={`main-container ${isOpen && sidebarContent ? "with-sidebar" : ""} ${isResizing ? "resizing" : ""}`}
          style={
            isOpen && sidebarContent && !isMobile
              ? {
                  marginLeft: theme.sidebarWidth,
                  width: `calc(100% - ${theme.sidebarWidth}px)`,
                }
              : {}
          }
        >
          <TopBar
            toggleSidebar={sidebarContent ? toggleSidebar : undefined}
            isSidebarOpen={sidebarContent ? isOpen : undefined}
          />
          <div className="main-content">
            <Suspense fallback={<div>main Loading...</div>}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>

      <style href={"sidebar" + theme.background} precedence="default">{`
        .sidebar-layout {
          display: flex; min-height: 100vh; background: ${theme.background};
          position: relative; overflow: hidden;
        }

        .sidebar {
          height: 100vh; position: fixed; top: 0; left: 0; z-index: ${zIndex.sidebar};
          display: flex; flex-direction: column; background: ${theme.backgroundSecondary};
          transition: transform 0.25s cubic-bezier(0.17, 0.67, 0.26, 0.99),
                      box-shadow 0.25s ease, width 0.25s cubic-bezier(0.17, 0.67, 0.26, 0.99);
          transform: translateX(-100%); will-change: transform, width;
        }

        .sidebar.resizing, .main-container.resizing {
          transition: none !important;
        }

        .sidebar.open { transform: translateX(0); }

        .sidebar-content {
          flex: 1; overflow-y: auto; overflow-x: hidden; color: ${theme.text};
          scrollbar-width: thin; scrollbar-color: ${theme.textLight} transparent;
        }

        .sidebar-content::-webkit-scrollbar { width: 4px; }
        .sidebar-content::-webkit-scrollbar-track { background: transparent; }
        .sidebar-content::-webkit-scrollbar-thumb {
          background: ${theme.textLight}; border-radius: 10px;
        }

        .main-container {
          flex: 1; background: ${theme.background}; color: ${theme.text};
          transition: margin-left 0.25s cubic-bezier(0.17, 0.67, 0.26, 0.99),
                      width 0.25s cubic-bezier(0.17, 0.67, 0.26, 0.99);
          min-height: 100vh; will-change: margin-left, width;
        }

        .main-content { width: 100%; position: relative; }

        .resize-handle {
          width: 10px; height: 100vh; position: fixed; top: 0;
          z-index: ${zIndex.sidebarResizeHandle}; display: flex;
          align-items: center; justify-content: center;
        }

        .resize-area {
          width: 100%; height: 100%; cursor: col-resize;
          background: ${isHandleHovered || isResizing ? `${theme.border}50` : "transparent"};
          transition: background-color 0.2s ease;
        }

        .sidebar-backdrop {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.4); z-index: ${zIndex.sidebarBackdrop};
          transition: opacity 0.25s ease-out;
        }

        body.no-select-cursor { cursor: col-resize !important; user-select: none; }
        body.no-scroll { overflow: hidden; }

        @media (max-width: 768px) {
          .sidebar {
            top: ${headerHeight}px; height: calc(100vh - ${headerHeight}px);
          }
          .sidebar.open { box-shadow: ${theme.shadowHeavy}; }
          .sidebar-backdrop { top: ${headerHeight}px; }
          .main-container.with-sidebar { margin-left: 0 !important; width: 100% !important; }
        }
      `}</style>
    </>
  );
};

export default MainLayout;
