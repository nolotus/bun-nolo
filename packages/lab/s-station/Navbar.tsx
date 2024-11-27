import React from "react";
import { useAuth } from "auth/useAuth";
import { removeToken, getTokensFromLocalStorage } from "auth/client/token";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { signOut, changeCurrentUser, selectUsers } from "auth/authSlice";
import { selectTheme } from "app/theme/themeSlice";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  PersonIcon,
  GearIcon,
  SignOutIcon,
  TriangleDownIcon,
} from "@primer/octicons-react";
import { useTranslation } from "react-i18next";

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

  const { isLoggedIn, user } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useAppSelector(selectTheme);
  const currentToken = useAppSelector((state: any) => state.auth.currentToken);

  console.log("isLoggedIn", isLoggedIn);
  console.log("user", user);
  const logout = () => {
    removeToken(currentToken);
    dispatch(signOut());
    navigate("/");
  };
  return (
    <div style={styles.container}>
      {isLoggedIn ? (
        <>
          <NavLink to="/login" style={styles.logo}>
            Selfr
          </NavLink>
          <button
            onClick={logout}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: theme.spacing.small,
              border: "none",
              background: "none",
              cursor: "pointer",
              borderRadius: theme.borderRadius,
              transition: "background-color 0.2s",
              color: theme.text1,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = theme.surface2)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <SignOutIcon size={theme.iconSize.medium} />
            <span style={{ marginLeft: theme.spacing.small }}>
              {t("common:logout")}
            </span>
          </button>
        </>
      ) : (
        <NavLink to="/login" style={styles.logo}>
          "not log"
        </NavLink>
      )}

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
