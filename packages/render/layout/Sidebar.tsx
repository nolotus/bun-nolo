// render/layout/Sidebar
import React, { useState, useEffect, ReactNode, useCallback } from "react";
import { SignOutIcon, SignInIcon, GearIcon } from "@primer/octicons-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectTheme } from "app/theme/themeSlice";
import { fixedLinks, bottomLinks, allowRule } from "auth/navPermissions";
import { RoutePaths } from "auth/client/routes";
import { useTranslation } from "react-i18next";

import { useAuth } from "auth/useAuth";
import { signOut } from "auth/authSlice";
import { removeToken } from "auth/client/token";

import SidebarToggleButton from "./SidebarToggleButton";
import NavListItem from "./blocks/NavListItem";

interface SidebarProps {
  children: ReactNode;
  sidebarContent: ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children, sidebarContent }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
    <div style={styles.container(theme)}>
      <SidebarToggleButton
        onClick={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />
      <aside style={styles.sidebar(theme, isSidebarOpen)}>
        <nav style={styles.nav}>
          {allowedFixedLinks.map((item) => (
            <NavListItem key={item.path} {...item} />
          ))}
        </nav>
        <div style={styles.sidebarContentContainer}>{sidebarContent}</div>
        <div style={styles.bottomSection(theme)}>
          {allowedBottomLinks.map((item) => (
            <NavListItem key={item.path} {...item} />
          ))}
          <div style={styles.authButtonsContainer}>
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
      <main style={styles.content(theme, isSidebarOpen)}>
        <div style={styles.innerContent(theme)}>{children}</div>
      </main>
    </div>
  );
};

const styles = {
  container: (theme) => ({
    display: "flex",
    minHeight: "100vh",
    backgroundColor: theme.backgroundColor,
  }),
  sidebar: (theme, isSidebarOpen) => ({
    width: "240px",
    backgroundColor: theme.surface1,
    height: "100vh",
    position: "fixed",
    left: isSidebarOpen ? 0 : "-240px",
    top: 0,
    overflowY: "auto",
    transition: "left 0.3s ease-in-out",
    zIndex: theme.zIndex.layer2,
    color: theme.text1,
    padding: "48px 16px 16px",
    display: "flex",
    flexDirection: "column",
  }),
  nav: {
    marginBottom: "24px",
  },
  sidebarContentContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    marginBottom: "24px",
  },
  bottomSection: (theme) => ({
    borderTop: `1px solid ${theme.text3}`,
    paddingTop: "16px",
    marginTop: "auto",
  }),
  authButtonsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "16px",
  },
  content: (theme, isSidebarOpen) => ({
    flexGrow: 1,
    marginLeft: isSidebarOpen ? "240px" : 0,
    transition: "margin-left 0.3s ease-in-out",
    width: isSidebarOpen ? "calc(100% - 240px)" : "100%",
    overflowX: "hidden",
    backgroundColor: theme.backgroundColor,
  }),
  innerContent: (theme) => ({
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "48px 24px 24px",
    color: theme.text1,
  }),
};

export default Sidebar;
