// render/layout/Sidebar.tsx
import { selectTheme, setSidebarWidth } from "app/theme/themeSlice";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { useAuth } from "auth/hooks/useAuth";
import { zIndex } from "render/styles/zIndex";
//web
import { SidebarTop } from "./SidebarTop";
import TopBar from "./TopBar";
interface SidebarProps {
  children: React.ReactNode;
  sidebarContent?: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children, sidebarContent }) => {
  const { isLoggedIn } = useAuth();
  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isHandleHovered, setIsHandleHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const theme = useSelector(selectTheme);

  // 处理侧边栏切换
  const toggleSidebar = useCallback((e?: React.MouseEvent) => {
    setIsHandleHovered(false);
    setIsOpen((prev) => !prev);
    if (e) {
      e.stopPropagation();
    }
  }, []);

  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    mouseDownEvent.stopPropagation();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  // 优化：使用 requestAnimationFrame 确保动画平滑
  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (!isResizing || !sidebarRef.current) return;

      requestAnimationFrame(() => {
        const newWidth = Math.round(
          mouseMoveEvent.clientX -
            sidebarRef.current!.getBoundingClientRect().left
        );
        if (newWidth > 200 && newWidth < 600) {
          dispatch(setSidebarWidth(newWidth));
          if (sidebarRef.current) {
            sidebarRef.current.style.width = `${newWidth}px`;
          }
        }
      });
    },
    [isResizing, dispatch]
  );

  const handleMouseEnter = useCallback(() => {
    setIsHandleHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHandleHovered(false);
  }, []);

  // 检查是否是移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (!sidebarContent) return;

    const handleResize = () => {
      const isDesktop = window.innerWidth >= 768;
      setIsOpen(isDesktop);
      setIsMobile(!isDesktop);
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

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
      document.body.classList.add("no-select-cursor");
    } else {
      document.body.classList.remove("no-select-cursor");
    }

    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
      document.body.classList.remove("no-select-cursor");
    };
  }, [resize, stopResizing, isResizing]);

  // 管理移动端侧边栏打开时阻止背景滚动
  useEffect(() => {
    if (isOpen && sidebarContent && isMobile) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [isOpen, sidebarContent, isMobile]);

  return (
    <div className="sidebar-layout">
      {sidebarContent && (
        <>
          <aside
            ref={sidebarRef}
            className={`sidebar ${isOpen ? "sidebar--open" : "sidebar--closed"} ${isResizing ? "is-resizing" : ""}`}
            style={{ width: `${theme.sidebarWidth}px` }}
          >
            {isLoggedIn && <SidebarTop />}
            <div className="sidebar__content">{sidebarContent}</div>
          </aside>

          {/* 调整手柄 - 只在桌面端显示 */}
          {isOpen && sidebarContent && !isMobile && (
            <div
              className="sidebar__resize-handle"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              style={{ left: `${theme.sidebarWidth - 5}px` }}
            >
              <div
                className="sidebar__resize-area"
                onMouseDown={startResizing}
                title="调整侧边栏宽度"
              ></div>
            </div>
          )}

          {/* 移动端遮罩 */}
          {isOpen && sidebarContent && isMobile && (
            <div className="sidebar-backdrop" onClick={toggleSidebar}></div>
          )}
        </>
      )}

      <main
        className={`main-container ${isOpen && sidebarContent ? "main-container--with-sidebar" : ""} ${isResizing ? "is-resizing" : ""}`}
        style={
          isOpen && sidebarContent && !isMobile
            ? {
                marginLeft: `${theme.sidebarWidth}px`,
                width: `calc(100% - ${theme.sidebarWidth}px)`,
              }
            : {}
        }
      >
        <TopBar
          toggleSidebar={sidebarContent ? toggleSidebar : undefined}
          isSidebarOpen={sidebarContent ? isOpen : undefined}
        />
        <div className="main-container__content">{children}</div>
      </main>

      <style>{`
        .sidebar-layout {
          display: flex;
          min-height: 100vh;
          background: ${theme.background};
          position: relative;
          overflow: hidden;
        }

        .sidebar {
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          z-index: ${zIndex.sidebar};
          display: flex;
          flex-direction: column;
          background: ${theme.background};
          transition:
            transform 0.25s cubic-bezier(0.17, 0.67, 0.26, 0.99),
            box-shadow 0.25s ease,
            width 0.25s cubic-bezier(0.17, 0.67, 0.26, 0.99);
          transform: translateX(-100%);
          box-shadow: none;
          will-change: transform, width;
        }

        .sidebar.is-resizing {
            transition: none !important;
        }

        .sidebar--closed {
          transform: translateX(-100%);
          box-shadow: none;
        }

        .sidebar--open {
          transform: translateX(0);
        }

        .sidebar__content {
          flex-grow: 1;
          overflow-y: auto;
          overflow-x: hidden;
          color: ${theme.text};
          scrollbar-width: thin;
          scrollbar-color: ${theme.textLight} transparent;
        }

        .sidebar__content::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar__content::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar__content::-webkit-scrollbar-thumb {
          background: ${theme.textLight};
          border-radius: 10px;
        }

        .main-container {
          flex-grow: 1;
          margin-left: 0;
          width: 100%;
          background: ${theme.background};
          color: ${theme.text};
          transition:
            margin-left 0.25s cubic-bezier(0.17, 0.67, 0.26, 0.99),
            width 0.25s cubic-bezier(0.17, 0.67, 0.26, 0.99);
          position: relative;
          min-height: 100vh;
          will-change: margin-left, width;
        }

        .main-container.is-resizing {
            transition: none !important;
        }

        .main-container__content {
          width: 100%;
          max-width: 100%;
          position: relative;
        }

        .sidebar__resize-handle {
          width: 10px;
          height: 100vh;
          position: fixed;
          top: 0;
          z-index: ${zIndex.sidebarResizeHandle};
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sidebar__resize-area {
          position: absolute;
          width: 100%;
          height: 100%;
          cursor: col-resize;
          background-color: ${
            isHandleHovered || isResizing ? `${theme.border}30` : "transparent"
          };
          transition: background-color 0.2s ease;
          z-index: ${zIndex.sidebarResizeArea};
        }

        body.no-select-cursor {
          cursor: col-resize !important;
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }

        .sidebar-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.4);
          z-index: ${zIndex.sidebarBackdrop};
          transition: opacity 0.25s ease-out;
        }

        body.no-scroll {
          overflow: hidden;
        }

        @media (max-width: 768px) {
          /* --- 新增/修改 --- */
          .sidebar {
            /* 让侧边栏在 TopBar 下方 */
            top: ${theme.headerHeight}px;
            height: calc(100vh - ${theme.headerHeight}px);
          }
        
          .sidebar-backdrop {
             /* 遮罩也从 TopBar 下方开始 */
            top: ${theme.headerHeight}px;
          }
          /* --- 修改结束 --- */

          .sidebar--open {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.05);
          }

          .main-container--with-sidebar {
            margin-left: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
