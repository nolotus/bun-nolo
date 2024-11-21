import React from "react";
import { NavLink } from "react-router-dom";

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
  return (
    <div style={styles.container}>
      <div style={styles.logo}>Selfr</div>
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
