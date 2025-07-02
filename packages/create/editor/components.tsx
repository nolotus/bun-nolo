// create/editor/components.tsx

import React, { useState } from "react";
import ReactDOM from "react-dom";

// 通用 Button 组件
export const Button: React.FC<
  React.HTMLAttributes<HTMLSpanElement> & {
    active?: boolean;
    reversed?: boolean;
  }
> = ({
  className = "",
  active = false,
  reversed = false,
  children,
  style = {},
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // 根据 active 和 reversed 计算文本颜色
  const color = reversed
    ? active
      ? "var(--background)" // 反转 + 激活：背景色（light: #FFF, dark: #111827）
      : "var(--textQuaternary)" // 反转 + 未激活：浅灰
    : active
      ? "var(--primary)" // 普通 + 激活：主色
      : "var(--textSecondary)"; // 普通 + 未激活：中深灰

  // 根据 hover 和 active 计算背景色
  const backgroundColor = isHovered
    ? reversed
      ? "var(--backgroundHover)" // 反转 + hover：背景悬停色
      : "var(--focus)" // 普通 + hover：主色 focus（10% 透明度）
    : active
      ? reversed
        ? "var(--backgroundSelected)" // 反转 + 激活：背景选中色
        : "var(--primaryHover)" // 普通 + 激活：主色 hover（10% 透明度）
      : "transparent";

  return (
    <span
      {...props}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        cursor: "pointer",
        color,
        padding: "var(--space-1) var(--space-2)", // 4px 8px
        borderRadius: "var(--space-1)", // 4px
        backgroundColor,
        transition: "color 0.2s, background-color 0.2s", // ✨ 优化：只动画必要属性
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      {children}
    </span>
  );
};

// 通用 Menu 组件
export const Menu = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = "", style = {}, ...props }, ref) => (
  <div
    {...props}
    ref={ref}
    data-test-id="menu"
    className={className}
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "var(--space-2)", // 8px
      ...style,
    }}
  />
));

// Portal 组件（保持不变）
export const Portal: React.FC = ({ children }) =>
  typeof document === "object"
    ? ReactDOM.createPortal(children, document.body)
    : null;
