import React from "react";
import { useAuth } from "auth/useAuth";
import { NavLink } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { IsLoggedInMenu } from "auth/pages/IsLoggedInMenu";
import NavListItem from "render/layout/blocks/NavListItem";
import { SignInIcon } from "@primer/octicons-react";
import { RoutePaths } from "auth/client/routes";
import { CreateMenu } from "create/CreateMenu";

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
};

const NavbarComponent = () => {
  const { t } = useTranslation();

  const { isLoggedIn } = useAuth();

  return (
    <div style={styles.container}>
      <div style={{ display: "flex", gap: "12px" }}>
        <CreateMenu />
        {isLoggedIn ? (
          <div>
            <IsLoggedInMenu />
          </div>
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
        <li style={styles.navItem}>
          <NavLink
            to="/collect"
            style={({ isActive }) => ({
              ...styles.link,
              fontSize: "20px",
              ...(isActive && styles.activeLink),
            })}
          >
            Collect
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default NavbarComponent;
