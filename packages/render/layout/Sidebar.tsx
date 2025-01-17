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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const theme = useSelector(selectTheme);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!sidebarContent) return;

    const handleResize = () => {
      if (typeof window !== "undefined") {
        setIsSidebarOpen(window.innerWidth >= 768);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "b") {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleSidebar, sidebarContent]);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: theme.background,
      }}
    >
      {sidebarContent && (
        <aside
          ref={sidebarRef}
          style={{
            width: `${theme.sidebarWidth}px`,
            backgroundColor: theme.backgroundSecondary,
            height: "100dvh",
            position: "fixed",
            left: isSidebarOpen ? 0 : `-${theme.sidebarWidth}px`,
            top: 0,
            transition: "left 0.3s ease-in-out",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            borderRight: `1px solid ${theme.border}`,
            boxShadow: `0 0 10px ${theme.shadowLight}`,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              overflow: "hidden",
            }}
          >
            <SidebarTop />
            <div
              style={{
                flexGrow: 1,
                overflowY: "auto",
                marginBottom: "1.25rem",
                color: theme.text,
              }}
            >
              {sidebarContent}
            </div>
          </div>
          <ResizeHandle sidebarRef={sidebarRef} theme={theme} />
        </aside>
      )}

      <main
        style={{
          flexGrow: 1,
          marginLeft:
            isSidebarOpen && sidebarContent ? `${theme.sidebarWidth}px` : 0,
          transition: "margin-left 0.3s ease-in-out",
          width:
            isSidebarOpen && sidebarContent
              ? `calc(100% - ${theme.sidebarWidth}px)`
              : "100%",
          background: theme.background,
          color: theme.text,
        }}
      >
        <TopBar
          toggleSidebar={sidebarContent ? toggleSidebar : undefined}
          theme={theme}
          topbarContent={topbarContent}
          isExpanded={isSidebarOpen}
        />

        <div
          style={{
            width: "100%",
            maxWidth: "100%",
            margin: "0 auto",
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
};

export default Sidebar;
