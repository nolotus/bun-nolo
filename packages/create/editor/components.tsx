import React from "react";
import ReactDOM from "react-dom";

export const Button = React.forwardRef(
  ({ className, active, reversed, children, ...props }, ref) => (
    <span
      {...props}
      ref={ref}
      className={className}
      style={{
        cursor: "pointer",
        color: reversed
          ? active
            ? "white"
            : "#aaa"
          : active
            ? "black"
            : "#ccc",
      }}
    >
      {children} {/* 添加这行 */}
    </span>
  ),
);

export const Menu = React.forwardRef(({ className, style, ...props }, ref) => (
  <div
    {...props}
    data-test-id="menu"
    ref={ref}
    style={{
      ...style,
      display: "flex",
      gap: "15px",
    }}
  />
));

export const Toolbar = React.forwardRef(
  ({ className, style, ...props }, ref) => (
    <Menu
      {...props}
      ref={ref}
      style={{
        position: "relative",
        padding: "1px 18px 17px",
        margin: "0 -20px",
        borderBottom: "2px solid #eee",
        marginBottom: "20px",
        ...style,
      }}
    />
  ),
);

export const Portal = ({ children }) => {
  return typeof document === "object"
    ? ReactDOM.createPortal(children, document.body)
    : null;
};
