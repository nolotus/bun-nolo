// 在 components.js 文件中

import React, { useState } from "react";
import ReactDOM from "react-dom";

// 统一按钮组件
export const Button = ({ className, active, reversed, children, ...props }) => {
  const [isHovered, setIsHovered] = useState(false);

  // 计算按钮颜色
  const getColor = () => {
    if (reversed) {
      return active ? "white" : "#aaa";
    } else {
      return active ? "#1890ff" : "#666";
    }
  };

  // 计算背景色
  const getBackgroundColor = () => {
    if (isHovered) {
      return reversed ? "rgba(255,255,255,0.15)" : "rgba(24,144,255,0.08)";
    } else {
      return active
        ? reversed
          ? "rgba(255,255,255,0.1)"
          : "rgba(24,144,255,0.1)"
        : "transparent";
    }
  };

  return (
    <span
      {...props}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        cursor: "pointer",
        color: getColor(),
        padding: "4px 6px",
        borderRadius: "4px",
        backgroundColor: getBackgroundColor(),
        transition: "all 0.2s",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        ...props.style,
      }}
    >
      {children}
    </span>
  );
};

// 统一菜单组件
export const Menu = React.forwardRef(({ className, style, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    data-test-id="menu"
    className={className}
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "6px",
      ...style,
    }}
  />
));

export const Portal = ({ children }) => {
  return typeof document === "object"
    ? ReactDOM.createPortal(children, document.body)
    : null;
};
