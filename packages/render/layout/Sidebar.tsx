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

import { SignInIcon } from "@primer/octicons-react";

import { useTranslation } from "react-i18next";
import { styles, themeStyles } from "render/ui/styles";
import OpenProps from "open-props";

import { useAuth } from "auth/useAuth";
import { fixedLinks, allowRule } from "auth/navPermissions";
import { RoutePaths } from "auth/client/routes";
import { IsLoggedInMenu } from "auth/pages/IsLoggedInMenu";

import NavListItem from "./blocks/NavListItem";
import TopBar from "./TopBar";

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
        ...themeStyles.bgColor1(theme),
      }}
    >
      <aside
        ref={sidebarRef}
        style={sidebarStyles(theme, isSidebarOpen, theme.sidebarWidth)}
      >
        <div style={sidebarContentStyles(theme)}>
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

          <nav style={{ marginBottom: OpenProps.size4 }}>
            {allowedFixedLinks.map((item) => (
              <NavListItem key={item.path} {...item} />
            ))}
          </nav>
          <div style={scrollableContentStyles}>{sidebarContent}</div>
        </div>
        <div style={resizeHandleStyles(theme)} onMouseDown={startResizing} />
      </aside>
      <main style={contentStyles(theme, isSidebarOpen, theme.sidebarWidth)}>
        <TopBar
          toggleSidebar={toggleSidebar}
          theme={theme}
          topbarContent={topbarContent}
        />
        <div style={innerContentStyles(theme, fullWidth)}>{children}</div>
      </main>
    </div>
  );
};

const sidebarStyles = (theme: any, isSidebarOpen: boolean, width: number) => ({
  width: `${width}px`,
  ...themeStyles.bgColor1(theme),
  height: "100vh",
  position: "fixed" as const,
  left: isSidebarOpen ? 0 : `-${width}px`,
  top: 0,
  transition: "left 0.3s ease-in-out",
  zIndex: 2,
  ...themeStyles.textColor1(theme),
  padding: theme.sidebarPadding, // 使用主题中的 padding 值
  display: "flex",
  flexDirection: "column" as const,
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
  ...themeStyles.bgColor1(theme),
});

const innerContentStyles = (theme: any, fullWidth: boolean) => ({
  width: fullWidth ? "100%" : "100%",
  maxWidth: fullWidth ? "none" : "1200px",
  margin: fullWidth ? 0 : "0 auto",
  padding: fullWidth ? 0 : "48px 24px 24px",
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
