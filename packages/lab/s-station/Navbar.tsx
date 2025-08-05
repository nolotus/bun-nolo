import React from "react";
import { useAuth } from "auth/hooks/useAuth";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NavListItem from "render/layout/blocks/NavListItem";
import { SignInIcon } from "@primer/octicons-react";
import { RoutePaths } from "auth/web/routes";

const styles = {
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: "120px",
    paddingLeft: "20px",
    paddingTop: "20px",
    paddingBottom: "20px",
  },
  logo: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#127436", // 森林绿
  },
  navList: {
    listStyle: "none",
    margin: "0",
    padding: "0",
    display: "flex",
  },
  navItem: {
    marginRight: "20px",
  },
  link: {
    color: "#127436", // 森林绿
  },
  activeLink: {
    textDecorationLine: "underline",
    textDecorationStyle: "wavy",
    textDecorationThickness: "2px",
  },
  userName: {
    fontSize: "16px",
    color: "#127436", // 森林绿
    marginRight: "20px",
  },
};

const NavbarComponent = () => {
  const { t } = useTranslation();
  const { isLoggedIn, user } = useAuth();

  return (
    <div style={styles.container}>
      <div style={{ display: "flex", gap: "12px" }}>
        {isLoggedIn ? (
          <div style={styles.userName}>{user?.username}</div>
        ) : (
          <NavListItem
            label={t("login")}
            icon={<SignInIcon size={16} />}
            path={RoutePaths.LOGIN}
          />
        )}
      </div>

      <ul style={styles.navList}>
        <li style={styles.navItem}>
          <NavLink
            to="/"
            exact
            style={({ isActive }) => ({
              ...styles.link,
              ...(isActive && styles.activeLink),
            })}
          >
            Moment
          </NavLink>
        </li>
        <li style={styles.navItem}>
          <NavLink
            to="/article"
            style={({ isActive }) => ({
              ...styles.link,
              fontSize: "20px",
              ...(isActive && styles.activeLink),
            })}
          >
            Article
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default NavbarComponent;
