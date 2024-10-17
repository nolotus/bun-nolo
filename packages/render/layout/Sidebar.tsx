// render/layout/Sidebar.tsx

import React, {
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectTheme, setSidebarWidth } from "app/theme/themeSlice";
import {
  HomeIcon,
  CommentDiscussionIcon,
  DatabaseIcon,
} from "@primer/octicons-react";

import { SignInIcon } from "@primer/octicons-react";

import { useTranslation } from "react-i18next";
import { styles, themeStyles } from "render/ui/styles";
import OpenProps from "open-props";

import { useAuth } from "auth/useAuth";
import { allowRule, NavItem } from "auth/navPermissions";
import { RoutePaths } from "auth/client/routes";
import { IsLoggedInMenu } from "auth/pages/IsLoggedInMenu";
import NavListItem from "./blocks/NavListItem";
import TopBar from "./TopBar";

export const fixedLinks: NavItem[] = [
  { path: "/", label: "Home", icon: <HomeIcon size={24} /> },
  { path: "/chat", label: "Chat", icon: <CommentDiscussionIcon size={24} /> },
  { path: "/life", label: "Databse", icon: <DatabaseIcon size={24} /> },
];
interface SidebarProps {
  children: ReactNode;
  sidebarContent: ReactNode;
  topbarContent?: ReactNode;
  fullWidth?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  children,
  sidebarContent,
  topbarContent,
  fullWidth = false,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isLoggedIn } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const theme = useSelector(selectTheme);
  const auth = useAuth();
  const allowedFixedLinks = allowRule(auth?.user, fixedLinks);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
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
        }
      }
    },
    [isResizing, dispatch],
  );

  useEffect(() => {
    const handleResize = () => {
      // 在小屏幕上默认关闭侧边栏
      setIsSidebarOpen(window.innerWidth >= 768);
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

    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [toggleSidebar, resize, stopResizing]);

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
        style={sidebarStyles(theme, isSidebarOpen, theme.sidebarWidth)}
      >
        <div style={sidebarContentStyles(theme)}>
          {/* 登录菜单或登录按钮 */}
          {isLoggedIn ? (
            <div style={{ marginBottom: OpenProps.size3 }}>
              <IsLoggedInMenu />
            </div>
          ) : (
            <NavListItem
              label={t("login")}
              icon={<SignInIcon size={16} />}
              path={RoutePaths.LOGIN}
            />
          )}

          {/* 固定链接导航 */}
          <nav style={{ marginBottom: OpenProps.size4 }}>
            {allowedFixedLinks.map((item) => (
              <NavListItem key={item.path} {...item} />
            ))}
          </nav>

          {/* 可滚动内容区域 */}
          <div style={scrollableContentStyles}>{sidebarContent}</div>
        </div>

        {/* 调整大小手柄 */}
        <div style={resizeHandleStyles(theme)} onMouseDown={startResizing} />
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
  height: "100vh",
  position: "fixed" as const,
  left: isSidebarOpen ? 0 : `-${width}px`,
  top: 0,
  transition: "left 0.3s ease-in-out",
  zIndex: 2,
  ...themeStyles.textColor1(theme),
  padding: theme.sidebarPadding,
  display: "flex",
  flexDirection: "column" as const,

  // 媒体查询，在大屏幕上默认打开侧边栏
  "@media (min-width: 768px)": {
    left: 0,
  },
});

const sidebarContentStyles = (theme: any) => ({
  display: "flex",
  flexDirection: "column" as const,
  height: "100%",
  overflow: "hidden",
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
  overflowX: "hidden" as const,
  ...themeStyles.surface1(theme),
});

const innerContentStyles = (theme: any, fullWidth: boolean) => ({
  width: fullWidth ? "100%" : "100%",
  maxWidth: fullWidth ? "none" : "1200px",
  margin: fullWidth ? 0 : "0 auto",
  padding: "0 20px", // 为内容区域添加 padding，使其与侧边栏之间留白
  ...themeStyles.textColor1(theme),
});

const resizeHandleStyles = (theme: any) => ({
  width: "4px",
  height: "100%",
  position: "absolute" as const,
  top: 0,
  right: 0,
  cursor: "col-resize",
  backgroundColor: theme.border,
});

export default Sidebar;
