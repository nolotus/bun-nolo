// render/layout/Sidebar.tsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";
import { styles, themeStyles } from "render/ui/styles";
import OpenProps from "open-props";

import TopBar from "./TopBar";
import ResizeHandle from "./ResizeHandle";
import { SidebarTop } from "./SidebarTop";

// 修改接口定义,使 sidebarContent 可选
interface SidebarProps {
  children: React.ReactNode;
  sidebarContent?: React.ReactNode; // 改为可选
  topbarContent?: React.ReactNode;
  fullWidth?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  children,
  sidebarContent,
  topbarContent,
  fullWidth = false,
}) => {
  // 只在有 sidebarContent 时才初始化和处理侧边栏状态
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const theme = useSelector(selectTheme);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    // 只在有侧边栏内容时才添加事件监听
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
        ...styles.flex,
        ...styles.h100vh,
        ...themeStyles.surface1(theme),
      }}
    >
      {/* 只在有 sidebarContent 时渲染侧边栏 */}
      {sidebarContent && (
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
            <div style={scrollableContentStyles}>{sidebarContent}</div>
          </div>
          <ResizeHandle sidebarRef={sidebarRef} theme={theme} />
        </aside>
      )}

      {/* 主要内容区域 - 根据是否有侧边栏调整样式 */}
      <main
        style={contentStyles(
          theme,
          sidebarContent ? isSidebarOpen : false,
          theme.sidebarWidth,
        )}
      >
        {/* 顶部栏 - 只在有侧边栏时显示切换按钮 */}
        <TopBar
          toggleSidebar={sidebarContent ? toggleSidebar : undefined}
          theme={theme}
          topbarContent={topbarContent}
          isExpanded={isSidebarOpen}
        />

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
