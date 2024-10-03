// render/layout/Sidebar.tsx
import React, {
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { SignOutIcon, SignInIcon, GearIcon } from "@primer/octicons-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectTheme } from "app/theme/themeSlice";
import { fixedLinks, bottomLinks, allowRule } from "auth/navPermissions";
import { RoutePaths } from "auth/client/routes";
import { useTranslation } from "react-i18next";
import { styles, themeStyles } from "render/ui/styles";
import OpenProps from "open-props";

import { useAuth } from "auth/useAuth";
import { signOut } from "auth/authSlice";
import { removeToken } from "auth/client/token";
import { IsLoggedInMenu } from "auth/pages/IsLoggedInMenu";

import SidebarToggleButton from "./SidebarToggleButton";
import NavListItem from "./blocks/NavListItem";

interface SidebarProps {
  children: ReactNode;
  sidebarContent: ReactNode;
  fullWidth?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  children,
  sidebarContent,
  fullWidth = false,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const theme = useSelector(selectTheme);
  const auth = useAuth();
  const currentToken = useSelector((state: any) => state.auth.currentToken);
  const allowedFixedLinks = allowRule(auth?.user, fixedLinks);
  const allowedBottomLinks = allowRule(auth?.user, bottomLinks);

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
          setSidebarWidth(newWidth);
        }
      }
    },
    [isResizing],
  );

  const logout = () => {
    removeToken(currentToken);
    dispatch(signOut());
    navigate("/");
  };

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
      <SidebarToggleButton
        onClick={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />
      <aside
        ref={sidebarRef}
        style={sidebarStyles(theme, isSidebarOpen, sidebarWidth)}
      >
        <div style={sidebarContentStyles}>
          {isLoggedIn && (
            <div style={{ marginBottom: OpenProps.size3 }}>
              <IsLoggedInMenu />
            </div>
          )}

          <nav style={{ marginBottom: OpenProps.size4 }}>
            {allowedFixedLinks.map((item) => (
              <NavListItem key={item.path} {...item} />
            ))}
          </nav>
          <div style={scrollableContentStyles}>{sidebarContent}</div>
          <div style={bottomContentStyles(theme)}>
            {allowedBottomLinks.map((item) => (
              <NavListItem key={item.path} {...item} />
            ))}
            <div
              style={{
                ...styles.flexColumn,
                ...styles.gap1,
                marginTop: OpenProps.size3,
              }}
            >
              {auth?.isLoggedIn ? (
                <>
                  <NavListItem
                    label="Settings"
                    icon={<GearIcon size={16} />}
                    path="/settings"
                  />
                  <NavListItem
                    label={t("logout")}
                    icon={<SignOutIcon size={16} />}
                    onClick={logout}
                  />
                </>
              ) : (
                <NavListItem
                  label={t("login")}
                  icon={<SignInIcon size={16} />}
                  path={RoutePaths.LOGIN}
                />
              )}
            </div>
          </div>
        </div>
        <div style={resizeHandleStyles(theme)} onMouseDown={startResizing} />
      </aside>
      <main style={contentStyles(theme, isSidebarOpen, sidebarWidth)}>
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
  padding: OpenProps.size3,
  display: "flex",
  flexDirection: "column" as const,
});

const sidebarContentStyles = {
  display: "flex",
  flexDirection: "column" as const,
  height: "100%",
  overflow: "hidden",
};

const scrollableContentStyles = {
  flexGrow: 1,
  overflowY: "auto" as const,
  marginBottom: OpenProps.size4,
};

const bottomContentStyles = (theme: any) => ({
  borderTop: `1px solid ${theme.text3}`,
  paddingTop: OpenProps.size3,
  marginTop: "auto",
});

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
