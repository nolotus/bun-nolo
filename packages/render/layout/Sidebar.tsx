// render/layout/Sidebar.tsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";
import { styles, themeStyles } from "render/ui/styles";
import OpenProps from "open-props";

import TopBar from "./TopBar";
import ResizeHandle from "./ResizeHandle";
import { SidebarTop } from "./SidebarTop";
interface SidebarProps {
  children: React.ReactNode;
  sidebarContent: React.ReactNode;
  topbarContent?: React.ReactNode;
  fullWidth?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  children,
  sidebarContent,
  topbarContent,
  fullWidth = false,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const theme = useSelector(selectTheme);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        // 在小屏幕上默认关闭侧边栏
        setIsSidebarOpen(window.innerWidth >= 768);
      }
    };
    handleResize(); // 初始判断
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
  }, [toggleSidebar]);

  return (
    <div
      style={{
        ...styles.flex,
        ...styles.h100vh,
        ...themeStyles.surface1(theme),
      }}
    >
      {/* 侧边栏 */}
      <aside
        ref={sidebarRef}
        style={{
          ...sidebarStyles(theme, isSidebarOpen, theme.sidebarWidth),
          left: isSidebarOpen ? 0 : `-${theme.sidebarWidth}px`,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column" as const,
            height: "100%",
            overflow: "hidden",
          }}
        >
          <SidebarTop />

          {/* 可滚动内容区域 */}
          <div style={scrollableContentStyles}>{sidebarContent}</div>
        </div>

        {/* 调整大小手柄 */}
        <ResizeHandle sidebarRef={sidebarRef} theme={theme} />
      </aside>

      {/* 主要内容区域 */}
      <main style={contentStyles(theme, isSidebarOpen, theme.sidebarWidth)}>
        {/* 顶部栏 */}
        <TopBar
          toggleSidebar={toggleSidebar}
          theme={theme}
          topbarContent={topbarContent}
          isExpanded={isSidebarOpen}
        />

        {/* 内部内容区域 */}
        <div style={innerContentStyles(theme, fullWidth)}>{children}</div>
      </main>
    </div>
  );
};

// 样式函数

const sidebarStyles = (theme: any, isSidebarOpen: boolean, width: number) => ({
  width: `${width}px`,
  ...themeStyles.surface1(theme),
  height: "100dvh",
  position: "fixed" as const,
  left: 0, // 默认在大屏幕打开
  top: 0,
  transition: "left 0.3s ease-in-out",
  zIndex: 2,
  ...themeStyles.textColor1(theme),
  padding: theme.sidebarPadding,
  display: "flex",
  flexDirection: "column" as const,
});

const scrollableContentStyles = {
  flexGrow: 1,
  overflowY: "auto" as const,
  marginBottom: OpenProps.size4,
};

const contentStyles = (
  theme: any,
  isSidebarOpen: boolean,
  sidebarWidth: number,
) => ({
  ...styles.flexGrow1,
  marginLeft: isSidebarOpen ? `${sidebarWidth}px` : 0,
  transition: "margin-left 0.3s ease-in-out",
  width: isSidebarOpen ? `calc(100% - ${sidebarWidth}px)` : "100%",
  ...themeStyles.surface1(theme),
});

const innerContentStyles = (theme: any, fullWidth: boolean) => ({
  width: fullWidth ? "100%" : "100%",
  maxWidth: fullWidth ? "none" : "100%",
  margin: fullWidth ? 0 : "0 auto",
  ...themeStyles.surface1(theme),
});

export default Sidebar;
