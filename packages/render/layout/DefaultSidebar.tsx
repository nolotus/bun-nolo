import React from "react";
import { Link } from "react-router-dom";
import { HomeIcon, SignInIcon } from "@primer/octicons-react";

const DefaultSidebar = () => (
  <ul style={{ listStyleType: "none", padding: 0 }}>
    <li style={{ marginBottom: "16px" }}>
      <Link
        to="/"
        style={{
          color: "#2563eb",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
        }}
      >
        <HomeIcon size={24} style={{ marginRight: "8px" }} />
        <span>Home</span>
      </Link>
    </li>
    <li style={{ marginBottom: "16px" }}>
      <Link
        to="/contact"
        style={{
          color: "#2563eb",
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
        }}
      >
        <SignInIcon size={24} style={{ marginRight: "8px" }} />
        <span>Contact</span>
      </Link>
    </li>
  </ul>
);

export default DefaultSidebar;
