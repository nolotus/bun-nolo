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
              {/* 可拖动区域 */}
              <div
                className="sidebar__resize-area"
                onMouseDown={startResizing}
                title="调整侧边栏宽度"
              ></div>
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
        <TopBar
          topbarContent={topbarContent}
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
