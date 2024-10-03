// render/layout/Sidebar.tsx
import React, { useState, useEffect, ReactNode, useCallback } from "react";
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
  const theme = useSelector(selectTheme);
  const auth = useAuth();
  const currentToken = useSelector((state) => state.auth.currentToken);
  const allowedFixedLinks = allowRule(auth?.user, fixedLinks);
  const allowedBottomLinks = allowRule(auth?.user, bottomLinks);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

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
        ...themeStyles.bgColor1(theme),
      }}
    >
      <SidebarToggleButton
        onClick={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />
      <aside style={sidebarStyles(theme, isSidebarOpen)}>
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
        <div
          style={{
            ...styles.flexColumn,
            ...styles.flexGrow1,
            marginBottom: OpenProps.size4,
          }}
        >
          {sidebarContent}
        </div>
        <div
          style={{
            borderTop: `1px solid ${theme.text3}`,
            paddingTop: OpenProps.size3,
            marginTop: "auto",
          }}
        >
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
      </aside>
      <main style={contentStyles(theme, isSidebarOpen)}>
        <div style={innerContentStyles(theme, fullWidth)}>{children}</div>
      </main>
    </div>
  );
};

const sidebarStyles = (theme, isSidebarOpen) => ({
  width: "240px",
  ...themeStyles.bgColor1(theme),
  height: "100vh",
  position: "fixed",
  left: isSidebarOpen ? 0 : "-240px",
  top: 0,
  overflowY: "auto",
  transition: "left 0.3s ease-in-out",
  zIndex: 2,
  ...themeStyles.textColor1(theme),
  padding: OpenProps.size3,
  ...styles.flexColumn,
});

const contentStyles = (theme, isSidebarOpen) => ({
  ...styles.flexGrow1,
  marginLeft: isSidebarOpen ? "240px" : 0,
  transition: "margin-left 0.3s ease-in-out",
  width: isSidebarOpen ? "calc(100% - 240px)" : "100%",
  overflowX: "hidden",
  ...themeStyles.bgColor1(theme),
});

const innerContentStyles = (theme, fullWidth) => ({
  width: fullWidth ? "100%" : "100%",
  maxWidth: fullWidth ? "none" : "1200px",
  margin: fullWidth ? 0 : "0 auto",
  padding: fullWidth ? 0 : "48px 24px 24px",
  ...themeStyles.textColor1(theme),
});

export default Sidebar;
