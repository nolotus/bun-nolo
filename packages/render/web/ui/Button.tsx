// render/web/ui/Button.tsx

import React from "react";
// 移除 unused import: useTheme
import { Link } from "react-router-dom";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "small" | "medium" | "large";
  icon?: React.ReactNode;
  loading?: boolean;
  block?: boolean;
  type?: "button" | "submit" | "reset";
  as?: React.ElementType; // 简化 as 类型
  to?: string;
}

// 修正多态组件的类型定义
const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      variant = "primary",
      size = "medium",
      icon,
      loading,
      disabled,
      block,
      type = "button",
      className = "",
      children,
      onClick,
      as: Component = "button",
      to,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const handleClick = (e: React.MouseEvent<any>) => {
      if (isDisabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e as any);
    };

    const commonProps = {
      className:
        `btn btn-${variant} btn-${size} ${block ? "btn-block" : ""} ${isDisabled ? "btn-disabled" : ""} ${className}`.trim(),
      // 如果 Component 是 Link，disabled 属性可能不被支持，主要靠样式和 onClick 拦截
      disabled: Component === "button" ? isDisabled : undefined,
      onClick: handleClick,
      ref: ref as any,
      ...rest,
    };

    const renderContent = () => (
      <span className="btn-content">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {icon && <span className="btn-icon">{icon}</span>}
            {children && <span className="btn-text">{children}</span>}
          </>
        )}
      </span>
    );

    // 特殊处理 React Router Link
    if (Component === Link) {
      return (
        <>
          <Component
            {...(commonProps as any)}
            to={to || "#"} // 防止 Link 缺少 to 报错
            style={{ textDecoration: "none" }}
          >
            {renderContent()}
          </Component>
          <ButtonStyles />
        </>
      );
    }

    return (
      <>
        <Component
          {...commonProps}
          // 只有 button 元素才有 type 属性
          type={Component === "button" ? type : undefined}
        >
          {renderContent()}
        </Component>
        <ButtonStyles />
      </>
    );
  }
);

const ButtonStyles = () => {
  return (
    <style href="button" precedence="medium">{`
      :root {
        --btn-radius: 10px;
        --btn-transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
        --btn-font-weight: 500;
      }

      .btn {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-family: inherit;
        font-weight: var(--btn-font-weight);
        line-height: 1;
        white-space: nowrap;
        vertical-align: middle;
        user-select: none;
        border-radius: var(--btn-radius);
        border: 1px solid transparent;
        cursor: pointer;
        transition: var(--btn-transition);
        text-decoration: none;
        outline: none;
        letter-spacing: 0.01em;
        -webkit-font-smoothing: antialiased;
      }

      .btn-small { height: 32px; padding: 0 12px; font-size: 0.8125rem; gap: 6px; }
      .btn-medium { height: 40px; padding: 0 16px; font-size: 0.875rem; gap: 8px; }
      .btn-large { height: 48px; padding: 0 24px; font-size: 1rem; gap: 10px; border-radius: 12px; }
      .btn-block { width: 100%; display: flex; }
      .btn-content { display: flex; align-items: center; justify-content: center; gap: inherit; z-index: 2; transform: translateY(-0.5px); }
      .btn-icon { display: flex; align-items: center; }

      /* Primary - 使用 color-mix 解决 hex 变量的透明度问题 */
      .btn-primary {
        background: var(--primary);
        background-image: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.05) 100%);
        color: #fff;
        border: 1px solid color-mix(in srgb, var(--text) 5%, transparent);
        box-shadow: 
          inset 0 1px 0 rgba(255, 255, 255, 0.2), 
          inset 0 -1px 0 rgba(0, 0, 0, 0.1),
          0 2px 4px color-mix(in srgb, var(--primary) 25%, transparent);
      }

      .btn-primary:hover:not(.btn-disabled) {
        transform: translateY(-1px);
        box-shadow: 
          inset 0 1px 0 rgba(255, 255, 255, 0.25), 
          0 4px 12px color-mix(in srgb, var(--primary) 35%, transparent);
        filter: brightness(1.05);
      }

      .btn-primary:active:not(.btn-disabled) {
        transform: translateY(1px) scale(0.97);
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.15);
        background-image: none;
      }

      /* Secondary */
      .btn-secondary {
        background: var(--background);
        color: var(--text);
        border-color: var(--border);
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      }
      .btn-secondary:hover:not(.btn-disabled) {
        background: var(--backgroundHover);
        border-color: var(--borderHover);
        color: var(--text);
        transform: translateY(-1px);
        box-shadow: 0 3px 8px rgba(0,0,0,0.08);
      }
      .btn-secondary:active:not(.btn-disabled) {
        transform: translateY(1px) scale(0.97);
        background: var(--backgroundTertiary);
        box-shadow: none;
      }

      /* Ghost */
      .btn-ghost {
        background: transparent;
        color: var(--textSecondary);
        border-color: transparent;
        box-shadow: none;
      }
      .btn-ghost:hover:not(.btn-disabled) {
        background: var(--backgroundHover);
        color: var(--text);
      }
      .btn-ghost:active:not(.btn-disabled) {
        background: var(--backgroundSecondary);
        transform: scale(0.97);
      }

      /* Danger */
      .btn-danger {
        background: var(--error);
        background-image: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.05) 100%);
        color: white;
        border: 1px solid rgba(0,0,0,0.05);
        box-shadow: 
          inset 0 1px 0 rgba(255, 255, 255, 0.2),
          inset 0 -1px 0 rgba(0, 0, 0, 0.1),
          0 2px 4px color-mix(in srgb, var(--error) 25%, transparent);
      }
      .btn-danger:hover:not(.btn-disabled) {
        transform: translateY(-1px);
        box-shadow: 
          inset 0 1px 0 rgba(255, 255, 255, 0.25),
          0 4px 12px color-mix(in srgb, var(--error) 35%, transparent);
        filter: brightness(1.05);
      }
      .btn-danger:active:not(.btn-disabled) {
        transform: translateY(1px) scale(0.97);
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.15);
      }

      .btn-disabled {
        opacity: 0.6;
        cursor: not-allowed;
        box-shadow: none !important;
        transform: none !important;
        filter: grayscale(0.2);
      }

      .btn:focus-visible {
        box-shadow: 0 0 0 2px var(--background), 0 0 0 4px color-mix(in srgb, var(--primary) 50%, transparent);
      }

      .dark .btn-secondary {
        background: rgba(255,255,255,0.05);
        border-color: rgba(255,255,255,0.1);
      }
      .dark .btn-secondary:hover:not(.btn-disabled) {
        background: rgba(255,255,255,0.1);
      }
      
      @media (prefers-reduced-motion: reduce) {
        .btn { transition: none; }
        .btn:hover, .btn:active { transform: none; }
      }
    `}</style>
  );
};

const LoadingSpinner = () => (
  <svg
    className="animate-spin"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      opacity="0.25"
    />
    <path
      d="M4 12a8 8 0 018-8"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <style>{`
      .animate-spin { animation: spin 1s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
    `}</style>
  </svg>
);

Button.displayName = "Button";

export default Button;
