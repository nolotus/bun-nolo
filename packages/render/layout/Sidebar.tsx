import { selectTheme } from "app/theme/themeSlice";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import ResizeHandle from "./ResizeHandle";
import { SidebarTop } from "./SidebarTop";
import TopBar from "./TopBar";

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
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const theme = useSelector(selectTheme);

  const toggleSidebar = useCallback(() => setIsOpen((prev) => !prev), []);

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

  return (
    <div className="app-layout">
      {sidebarContent && (
        <aside
          ref={sidebarRef}
          className={`app-sidebar ${isOpen ? "sidebar-open" : "sidebar-closed"}`}
        >
          <SidebarTop />
          <div className="sidebar-content">{sidebarContent}</div>
          <ResizeHandle sidebarRef={sidebarRef} theme={theme} />
        </aside>
      )}

      <main
        className={`app-main ${isOpen && sidebarContent ? "with-sidebar" : ""}`}
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
          width: ${theme.sidebarWidth}px;
          height: 100dvh;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 10;
          display: flex;
          flex-direction: column;
          background: ${theme.background};
          border-right: 1px solid ${theme.border};
          transition:
            transform 0.25s cubic-bezier(0.17, 0.67, 0.26, 0.99),
            box-shadow 0.25s ease;
        }

        .sidebar-closed {
          transform: translateX(-${theme.sidebarWidth}px);
          box-shadow: none;
        }

        .sidebar-open {
          transform: translateX(0);
          box-shadow: 0 0 20px ${theme.shadowMedium};
        }

        .sidebar-content {
          flex-grow: 1;
          overflow-y: auto;
          overflow-x: hidden;
          color: ${theme.text};
          scrollbar-width: thin;
          scrollbar-color: ${theme.textLight} transparent;
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

        .app-main.with-sidebar {
          margin-left: ${theme.sidebarWidth}px;
          width: calc(100% - ${theme.sidebarWidth}px);
        }

        .main-content {
          width: 100%;
          max-width: 100%;
          position: relative;
        }

        @media (max-width: 768px) {
          .app-main.with-sidebar {
            margin-left: 0;
            width: 100%;
          }

          .sidebar-open {
            box-shadow: 0 0 40px ${theme.shadowHeavy};
          }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
