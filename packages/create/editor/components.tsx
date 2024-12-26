import React from "react";
import ReactDOM from "react-dom";

export const Button = ({ className, active, reversed, children, ...props }) => (
  <span
    {...props}
    className={className}
    style={{
      cursor: "pointer",
      color: reversed ? (active ? "white" : "#aaa") : active ? "black" : "#ccc",
    }}
  >
    {children}
  </span>
);

export const Menu = ({ className, style, ...props }) => (
  <div
    {...props}
    data-test-id="menu"
    style={{
      ...style,
      display: "flex",
      gap: "15px",
    }}
  />
);

export const Toolbar = ({ className, style, ...props }) => (
  <Menu
    {...props}
    style={{
      position: "relative",
      padding: "1px 18px 17px",
      margin: "0 -20px",
      borderBottom: "2px solid #eee",
      marginBottom: "20px",
      ...style,
    }}
  />
);

export const Portal = ({ children }) => {
  return typeof document === "object"
    ? ReactDOM.createPortal(children, document.body)
    : null;
};
