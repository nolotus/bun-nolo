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

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing && sidebarRef.current) {
        const newWidth =
          mouseMoveEvent.clientX -
          sidebarRef.current.getBoundingClientRect().left;
        if (newWidth > 200 && newWidth < 600) {
          dispatch(setSidebarWidth(newWidth));
          if (sidebarRef.current) {
            sidebarRef.current.style.width = `${newWidth}px`;
          }
        }
      }
    },
    [isResizing, dispatch]
  );

  const handleMouseEnter = useCallback(() => {
    setIsHandleHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHandleHovered(false);
  }, []);

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

  // 删除了 isHomeSidebar 和 sidebar__content--home 相关逻辑

  const lineColor =
    theme.mode === "dark"
      ? "rgba(200, 200, 200, 0.6)"
      : "rgba(60, 60, 60, 0.6)";
  const lineHoverColor =
    theme.mode === "dark"
      ? "rgba(230, 230, 230, 0.9)"
      : "rgba(30, 30, 30, 0.9)";

  return (
    <div className="sidebar-layout">
      {sidebarContent && (
        <>
          <aside
            ref={sidebarRef}
            className={`sidebar ${isOpen ? "sidebar--open" : "sidebar--closed"}`}
            style={{ width: `${theme.sidebarWidth}px` }}
          >
            {isLoggedIn && <SidebarTop />}
            <div className="sidebar__content">{sidebarContent}</div>
          </aside>

          {/* 侧边栏打开时的调整手柄 */}
          {isOpen && sidebarContent && (
            <div
              className="sidebar__resize-handle"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              style={{ left: `${theme.sidebarWidth - 5}px` }}
            >
              {/* 竖线按钮（用于开关） */}
              <div
                onClick={toggleSidebar}
                className={`sidebar__toggle ${isHandleHovered ? "sidebar__toggle--hovered" : ""}`}
                title="关闭侧边栏 (Ctrl+B)"
                aria-label="关闭侧边栏，快捷键 Ctrl+B"
              >
                <div className="sidebar__toggle-line"></div>
                <span className="sidebar__tooltip">关闭侧边栏 (Ctrl+B)</span>
              </div>

              {/* 可拖动区域 */}
              <div
                className="sidebar__resize-area"
                onMouseDown={startResizing}
                title="调整侧边栏宽度"
              ></div>
            </div>
          )}

          {/* 侧边栏关闭时的切换按钮 */}
          {!isOpen && sidebarContent && (
            <div
              className={`sidebar-toggle--closed ${isHandleHovered ? "sidebar-toggle--closed--hovered" : ""}`}
              onClick={toggleSidebar}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              title="打开侧边栏 (Ctrl+B)"
              aria-label="打开侧边栏，快捷键 Ctrl+B"
            >
              <div className="sidebar__toggle-line"></div>
              <span className="sidebar__tooltip">打开侧边栏 (Ctrl+B)</span>
            </div>
          )}
        </>
      )}

      <main
        className={`main-container ${isOpen && sidebarContent ? "main-container--with-sidebar" : ""}`}
        style={
          isOpen && sidebarContent
            ? {
                marginLeft: `${theme.sidebarWidth}px`,
                width: `calc(100% - ${theme.sidebarWidth}px)`,
              }
            : {}
        }
      >
        <TopBar theme={theme} topbarContent={topbarContent} />
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
        }

        .main-container__content {
          width: 100%;
          max-width: 100%;
          position: relative;
        }

        /* 调整手柄 */
        .sidebar__resize-handle {
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
        .sidebar__toggle {
          position: absolute;
          width: 24px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 16;
        }

        /* 可调整宽度的区域 */
        .sidebar__resize-area {
          position: absolute;
          width: 100%;
          height: 100%;
          cursor: col-resize;
          background-color: ${
            isHandleHovered || isResizing ? `${theme.border}30` : "transparent"
          };
          transition: background-color 0.2s ease;
          z-index: 14;
        }

        /* 侧边栏关闭状态下的切换按钮 */
        .sidebar-toggle--closed {
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
          transition: background-color 0.2s ease;
        }
        
        /* 悬停状态背景 */
        .sidebar-toggle--closed--hovered {
          background-color: ${`${theme.border}30`};
        }

        /* 简单的竖线 - 更深的默认颜色 */
        .sidebar__toggle-line {
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
        .sidebar__toggle--hovered .sidebar__toggle-line,
        .sidebar__toggle:hover .sidebar__toggle-line {
          background-color: ${lineHoverColor};
          transform: translateX(-2px);
          width: 5px;
          clip-path: polygon(100% 5%, 20% 50%, 100% 95%);
          border-radius: 8px;
          box-shadow: 0 0 4px rgba(0, 0, 0, 0.15);
        }
        
        /* 关闭状态下悬停 - 变为左箭头 < 更美观版本 */
        .sidebar-toggle--closed--hovered .sidebar__toggle-line,
        .sidebar-toggle--closed:hover .sidebar__toggle-line {
          background-color: ${lineHoverColor};
          transform: translateX(2px);
          width: 5px;
          clip-path: polygon(0% 5%, 80% 50%, 0% 95%);
          border-radius: 8px;
          box-shadow: 0 0 4px rgba(0, 0, 0, 0.15);
        }

        /* 提示工具提示样式 - 统一在右侧 */
        .sidebar__tooltip {
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
        
        /* 显示tooltip的条件同时支持:hover和.hovered类 */
        .sidebar__toggle:hover .sidebar__tooltip,
        .sidebar__toggle--hovered .sidebar__tooltip,
        .sidebar-toggle--closed:hover .sidebar__tooltip,
        .sidebar-toggle--closed--hovered .sidebar__tooltip {
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
