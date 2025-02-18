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

  const sidebarStyle = {
    width: `${theme.sidebarWidth}px`,
    height: "100dvh",
    position: "fixed" as const,
    left: isOpen ? 0 : `-${theme.sidebarWidth}px`,
    transition: "left 0.3s ease-in-out",
    zIndex: 2,
    display: "flex",
    flexDirection: "column" as const,
    background: theme.backgroundSecondary,
    borderRight: `1px solid ${theme.border}`,
    boxShadow: `0 0 10px ${theme.shadowLight}`,
  };

  const mainStyle = {
    flexGrow: 1,
    marginLeft: isOpen && sidebarContent ? `${theme.sidebarWidth}px` : 0,
    transition: "margin-left 0.3s ease-in-out",
    width:
      isOpen && sidebarContent
        ? `calc(100% - ${theme.sidebarWidth}px)`
        : "100%",
    background: theme.background,
    color: theme.text,
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: theme.background,
      }}
    >
      {sidebarContent && (
        <aside ref={sidebarRef} style={sidebarStyle}>
          <SidebarTop />
          <div style={{ flexGrow: 1, overflowY: "auto", color: theme.text }}>
            {sidebarContent}
          </div>
          <ResizeHandle sidebarRef={sidebarRef} theme={theme} />
        </aside>
      )}

      <main style={mainStyle}>
        <TopBar
          toggleSidebar={sidebarContent ? toggleSidebar : undefined}
          theme={theme}
          topbarContent={topbarContent}
          isExpanded={isOpen}
        />
        <div style={{ width: "100%", maxWidth: "100%" }}>{children}</div>
      </main>
    </div>
  );
};

export default Sidebar;
