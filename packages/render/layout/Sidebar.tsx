import { selectTheme } from "app/theme/themeSlice";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { SidebarTop } from "./SidebarTop";
import TopBar from "./TopBar";
import { useAuth } from "auth/hooks/useAuth";
import { setSidebarWidth } from "app/theme/themeSlice";

interface SidebarProps {
  children: React.ReactNode;
  sidebarContent?: React.ReactNode;
  topbarContent?: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({
  children,
  sidebarContent,
  topbarContent,
}) => {
  const { isLoggedIn, user } = useAuth();
  const dispatch = useDispatch();

  const [isOpen, setIsOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isHandleHovered, setIsHandleHovered] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const theme = useSelector(selectTheme);

  const toggleSidebar = useCallback(() => setIsOpen((prev) => !prev), []);

  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault();
    mouseDownEvent.stopPropagation(); // 防止事件冒泡到外层
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing && sidebarRef.current) {
        const newWidth =
          mouseMoveEvent.clientX -
          sidebarRef.current.getBoundingClientRect().left;
        if (newWidth > 200 && newWidth < 600) {
          dispatch(setSidebarWidth(newWidth));
          // 立即更新DOM，确保拖动顺畅
          if (sidebarRef.current) {
            sidebarRef.current.style.width = `${newWidth}px`;
          }
        }
      }
    },
    [isResizing, dispatch]
  );

  useEffect(() => {
    if (!sidebarContent) return;

    const handleResize = () => {
      setIsOpen(window?.innerWidth >= 768);
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
    }

    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing, isResizing]);

  const isHomeSidebar = sidebarContent?.type?.name === "HomeSidebarContent";

  // 使用计算值而非硬编码颜色
  const lineColor =
    theme.mode === "dark"
      ? "rgba(200, 200, 200, 0.6)"
      : "rgba(60, 60, 60, 0.6)";
  const lineHoverColor =
    theme.mode === "dark"
      ? "rgba(230, 230, 230, 0.9)"
      : "rgba(30, 30, 30, 0.9)";

  return (
    <div className="app-layout">
      {sidebarContent && (
        <>
          <aside
            ref={sidebarRef}
            className={`app-sidebar ${isOpen ? "sidebar-open" : "sidebar-closed"}`}
            style={{ width: `${theme.sidebarWidth}px` }}
          >
            {isLoggedIn && <SidebarTop />}
            <div
              className={`sidebar-content ${isHomeSidebar ? "home-sidebar" : ""}`}
            >
              {sidebarContent}
            </div>
          </aside>

          {/* 侧边栏打开时的调整手柄 */}
          {isOpen && sidebarContent && (
            <div
              className="resize-handle"
              onMouseEnter={() => setIsHandleHovered(true)}
              onMouseLeave={() => setIsHandleHovered(false)}
              style={{ left: `${theme.sidebarWidth - 5}px` }}
            >
              {/* 竖线按钮（用于开关） */}
              <div
                onClick={toggleSidebar}
                className="toggle-button"
                title="关闭侧边栏 (Ctrl+B)"
                aria-label="关闭侧边栏，快捷键 Ctrl+B"
              >
                <div className="toggle-line"></div>
                <span className="tooltip">关闭侧边栏 (Ctrl+B)</span>
              </div>

              {/* 可拖动区域 */}
              <div
                className="resize-area"
                onMouseDown={startResizing}
                title="调整侧边栏宽度"
              ></div>
            </div>
          )}

          {/* 侧边栏关闭时的切换按钮 */}
          {!isOpen && sidebarContent && (
            <div
              className="sidebar-toggle-closed"
              onClick={toggleSidebar}
              onMouseEnter={() => setIsHandleHovered(true)}
              onMouseLeave={() => setIsHandleHovered(false)}
              title="打开侧边栏 (Ctrl+B)"
              aria-label="打开侧边栏，快捷键 Ctrl+B"
            >
              <div className="toggle-line"></div>
              <span className="tooltip">打开侧边栏 (Ctrl+B)</span>
            </div>
          )}
        </>
      )}

      <main
        className={`app-main ${isOpen && sidebarContent ? "with-sidebar" : ""}`}
        style={
          isOpen && sidebarContent
            ? {
                marginLeft: `${theme.sidebarWidth}px`,
                width: `calc(100% - ${theme.sidebarWidth}px)`,
              }
            : {}
        }
      >
        <TopBar
          toggleSidebar={sidebarContent ? toggleSidebar : undefined}
          theme={theme}
          topbarContent={topbarContent}
          isExpanded={isOpen}
        />
        <div className="main-content">{children}</div>
      </main>

      <style>{`
        .app-layout {
          display: flex;
          min-height: 100vh;
          background: ${theme.background};
          position: relative;
          overflow: hidden;
        }

        .app-sidebar {
          height: 100dvh;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 10;
          display: flex;
          flex-direction: column;
          background: ${theme.background};
          transition:
            transform 0.25s cubic-bezier(0.17, 0.67, 0.26, 0.99),
            box-shadow 0.25s ease;
        }

        .sidebar-closed {
          transform: translateX(-100%);
          box-shadow: none;
        }

        .sidebar-open {
          transform: translateX(0);
        }

        .sidebar-content {
          flex-grow: 1;
          overflow-y: auto;
          overflow-x: hidden;
          color: ${theme.text};
          scrollbar-width: thin;
          scrollbar-color: ${theme.textLight} transparent;
        }

        .home-sidebar {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: flex-start;
          padding-top: 20%;
          padding-left: 16px;
          width: 100%;
        }

        .sidebar-content::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-content::-webkit-scrollbar-thumb {
          background: ${theme.textLight};
          border-radius: 10px;
        }

        .app-main {
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
        }

        .main-content {
          width: 100%;
          max-width: 100%;
          position: relative;
        }

        /* 调整手柄 */
        .resize-handle {
          width: 10px;
          height: 100dvh;
          position: fixed;
          top: 0;
          z-index: 15;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* 竖线按钮 */
        .toggle-button {
          position: absolute;
          width: 24px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 16; /* 高于resize区域 */
        }

        /* 可调整宽度的区域 */
        .resize-area {
          position: absolute;
          width: 100%;
          height: 100%;
          cursor: col-resize;
          background-color: ${
            isHandleHovered || isResizing ? `${theme.border}30` : "transparent"
          };
          transition: background-color 0.2s ease;
          z-index: 14; /* 低于toggle按钮 */
        }

        /* 侧边栏关闭状态下的切换按钮 */
        .sidebar-toggle-closed {
          width: 24px;
          height: 100dvh;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background-color: ${isHandleHovered ? `${theme.border}30` : "transparent"};
          transition: background-color 0.2s ease;
        }

        /* 简单的竖线 - 更深的默认颜色 */
        .toggle-line {
          width: 3px;
          height: 36px;
          background-color: ${lineColor};
          border-radius: 6px;
          box-shadow: 0 0 2px rgba(0, 0, 0, 0.1);
          transition: 
            transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
            background-color 0.3s ease,
            width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
            clip-path 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
            border-radius 0.3s ease,
            box-shadow 0.3s ease;
        }
        
        /* 打开状态下悬停 - 变为右箭头 > 更美观版本 */
        .toggle-button:hover .toggle-line {
          background-color: ${lineHoverColor};
          transform: translateX(-2px);
          width: 5px;
          clip-path: polygon(100% 5%, 20% 50%, 100% 95%);
          border-radius: 8px;
          box-shadow: 0 0 4px rgba(0, 0, 0, 0.15);
        }
        
        /* 关闭状态下悬停 - 变为左箭头 < 更美观版本 */
        .sidebar-toggle-closed:hover .toggle-line {
          background-color: ${lineHoverColor};
          transform: translateX(2px);
          width: 5px;
          clip-path: polygon(0% 5%, 80% 50%, 0% 95%);
          border-radius: 8px;
          box-shadow: 0 0 4px rgba(0, 0, 0, 0.15);
        }

        /* 提示工具提示样式 - 统一在右侧 */
        .tooltip {
          position: absolute;
          top: calc(50% - 15px);
          left: 20px;
          background-color: ${theme.background};
          color: ${theme.text};
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          opacity: 0;
          pointer-events: none;
          transform: translateX(5px);
          transition: opacity 0.2s ease, transform 0.2s ease;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          z-index: 100;
        }
        
        .toggle-button:hover .tooltip,
        .sidebar-toggle-closed:hover .tooltip {
          opacity: 1;
          transform: translateX(0);
        }

        ${
          isResizing
            ? `
          body {
            cursor: col-resize !important;
            user-select: none;
          }
        `
            : ""
        }

        @media (max-width: 768px) {
          .app-main.with-sidebar {
            margin-left: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
