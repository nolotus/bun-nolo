// render/web/ui/Button.tsx

import React from "react";
import { useTheme } from "app/theme";
import { Link, LinkProps } from "react-router-dom";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "small" | "medium" | "large";
  icon?: React.ReactNode;
  loading?: boolean;
  block?: boolean;
  type?: "button" | "submit" | "reset";
  as?: React.ElementType | typeof Link;
  to?: string;
}

type PolymorphicComponentProps<E extends React.ElementType> =
  React.ComponentPropsWithoutRef<E> & {
    as?: E;
  };

type ButtonComponent = <E extends React.ElementType = "button">(
  props: PolymorphicComponentProps<E> & ButtonProps
) => React.ReactElement | null;

const Button: ButtonComponent = React.forwardRef(
  <E extends React.ElementType = "button">(
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
    }: PolymorphicComponentProps<E> & ButtonProps,
    ref: React.Ref<any>
  ) => {
    const theme = useTheme();
    const isDisabled = disabled || loading;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) return;
      onClick?.(e);
    };

    const commonProps = {
      className:
        `btn btn-${variant} btn-${size} ${block ? "btn-block" : ""} ${isDisabled ? "btn-disabled" : ""} ${className}`.trim(),
      disabled: isDisabled,
      onClick: handleClick,
      ref,
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

    if (Component === Link) {
      return (
        <>
          <Component
            {...commonProps}
            to={to || "#"}
            style={{ textDecoration: "none", display: "inline-flex" }}
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
          type={Component === "button" ? type : undefined}
        >
          {renderContent()}
        </Component>
        <ButtonStyles />
      </>
    );
  }
) as ButtonComponent;

const ButtonStyles = () => {
  const theme = useTheme();

  return (
    <style href="button" precedence="medium">{`
      .btn {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif;
        font-weight: 550;
        line-height: 1.2;
        text-align: center;
        vertical-align: middle;
        user-select: none;
        border-radius: ${theme.space[3]};
        border: none;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        text-decoration: none;
        outline: none;
        background-clip: padding-box;
        letter-spacing: -0.01em;
        box-shadow: 
          0 2px 6px ${theme.shadow1},
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }

      /* 尺寸系统 */
      .btn-small {
        min-height: 32px;
        padding: ${theme.space[2]} ${theme.space[3]};
        font-size: 0.875rem;
        gap: ${theme.space[1]};
        border-radius: ${theme.space[2]};
      }

      .btn-medium {
        min-height: 40px;
        padding: ${theme.space[2]} ${theme.space[4]};
        font-size: 0.925rem;
        gap: ${theme.space[2]};
      }

      .btn-large {
        min-height: 48px;
        padding: ${theme.space[3]} ${theme.space[5]};
        font-size: 1rem;
        gap: ${theme.space[2]};
        border-radius: ${theme.space[4]};
      }

      .btn-block {
        width: 100%;
      }

      .btn-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: inherit;
        position: relative;
        z-index: 1;
      }

      .btn-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
        flex-shrink: 0;
      }

      .btn-text {
        line-height: 1.4;
        white-space: normal;
        text-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
      }

      /* Primary 样式 - 现代新拟物 */
      .btn-primary {
        background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primary}90 100%);
        color: white;
        box-shadow: 
          0 2px 8px ${theme.primary}30,
          0 1px 3px ${theme.shadow1},
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
      }

      .btn-primary::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
        border-radius: inherit;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      }

      .btn-primary:hover:not(.btn-disabled) {
        transform: translateY(-2px);
        box-shadow: 
          0 8px 20px ${theme.primary}40,
          0 2px 8px ${theme.shadow2},
          inset 0 1px 0 rgba(255, 255, 255, 0.25);
      }

      .btn-primary:hover:not(.btn-disabled)::before {
        opacity: 1;
      }

      .btn-primary:active:not(.btn-disabled) {
        transform: translateY(0);
        transition-duration: 0.1s;
        box-shadow: 
          0 2px 6px ${theme.primary}40,
          inset 0 2px 4px rgba(0, 0, 0, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }

      /* Secondary 样式 */
      .btn-secondary {
        background: ${theme.backgroundSecondary};
        color: ${theme.text};
        border: 1px solid ${theme.border};
        box-shadow: 
          0 1px 3px ${theme.shadow1},
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }

      .btn-secondary::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, ${theme.primary}08 0%, transparent 50%);
        border-radius: inherit;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      }

      .btn-secondary:hover:not(.btn-disabled) {
        background: ${theme.background};
        border-color: ${theme.primary}30;
        color: ${theme.primary};
        transform: translateY(-1px);
        box-shadow: 
          0 4px 12px ${theme.shadow1},
          0 0 0 1px ${theme.primary}15,
          inset 0 1px 0 rgba(255, 255, 255, 0.15);
      }

      .btn-secondary:hover:not(.btn-disabled)::before {
        opacity: 1;
      }

      .btn-secondary:active:not(.btn-disabled) {
        transform: translateY(0);
        transition-duration: 0.1s;
        box-shadow: 
          0 1px 3px ${theme.shadow1},
          inset 0 2px 4px rgba(0, 0, 0, 0.05);
      }

      /* Ghost 样式 */
      .btn-ghost {
        background: transparent;
        color: ${theme.textSecondary};
        border: 1px solid ${theme.borderLight};
        box-shadow: none;
      }

      .btn-ghost:hover:not(.btn-disabled) {
        background: ${theme.backgroundHover};
        color: ${theme.text};
        border-color: ${theme.border};
        box-shadow: 0 2px 8px ${theme.shadow1};
      }

      .btn-ghost:active:not(.btn-disabled) {
        background: ${theme.backgroundSelected || theme.backgroundHover};
        box-shadow: inset 0 1px 3px ${theme.shadow1};
      }

      /* Danger 样式 */
      .btn-danger {
        background: linear-gradient(135deg, ${theme.error} 0%, ${theme.error}90 100%);
        color: white;
        box-shadow: 
          0 2px 8px ${theme.error}30,
          0 1px 3px ${theme.shadow1},
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
      }

      .btn-danger::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
        border-radius: inherit;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
      }

      .btn-danger:hover:not(.btn-disabled) {
        transform: translateY(-2px);
        box-shadow: 
          0 8px 20px ${theme.error}40,
          0 2px 8px ${theme.shadow2},
          inset 0 1px 0 rgba(255, 255, 255, 0.25);
      }

      .btn-danger:hover:not(.btn-disabled)::before {
        opacity: 1;
      }

      .btn-danger:active:not(.btn-disabled) {
        transform: translateY(0);
        transition-duration: 0.1s;
        box-shadow: 
          0 2px 6px ${theme.error}40,
          inset 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      /* 禁用状态 */
      .btn-disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
        filter: grayscale(0.3);
        pointer-events: none;
      }

      .btn-disabled::before {
        display: none;
      }

      /* 焦点状态 */
      .btn:focus-visible:not(.btn-disabled) {
        box-shadow: 
          0 0 0 2px ${theme.background},
          0 0 0 4px ${theme.primary},
          0 2px 8px ${theme.shadow1},
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }

      /* 加载状态特殊样式 */
      .btn:has(.loading-spinner) {
        pointer-events: none;
      }

      .btn:has(.loading-spinner) .btn-text {
        opacity: 0.7;
      }

      /* 触摸设备优化 */
      @media (hover: none) and (pointer: coarse) {
        .btn:hover:not(.btn-disabled) {
          transform: none;
        }

        .btn:active:not(.btn-disabled) {
          transform: scale(0.95);
          transition-duration: 0.1s;
        }
      }

      /* 减少动画偏好 */
      @media (prefers-reduced-motion: reduce) {
        .btn {
          transition: background-color 0.1s ease, border-color 0.1s ease;
        }

        .btn:hover:not(.btn-disabled),
        .btn:active:not(.btn-disabled) {
          transform: none;
        }

        .btn::before {
          transition: none;
        }
      }

      /* 高对比度模式 */
      @media (prefers-contrast: high) {
        .btn {
          border-width: 2px;
        }
        
        .btn-ghost,
        .btn-secondary {
          border-width: 2px;
        }
      }

      /* 加载动画 */
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .loading-spinner {
        animation: spin 0.8s linear infinite;
      }

      @media (prefers-reduced-motion: reduce) {
        .loading-spinner {
          animation: none;
        }
        
        .loading-spinner::after {
          content: '...';
        }
      }

      /* 响应式调整 */
      @media (max-width: 480px) {
        .btn-medium {
          min-height: 44px;
          padding: ${theme.space[3]} ${theme.space[4]};
        }
        
        .btn-small {
          min-height: 36px;
          padding: ${theme.space[2]} ${theme.space[3]};
        }
      }
    `}</style>
  );
};

// 优化的加载指示器
const LoadingSpinner = () => (
  <svg
    className="loading-spinner"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <circle
      cx="8"
      cy="8"
      r="6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.25"
    />
    <path
      d="M14 8A6 6 0 012 8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

Button.displayName = "Button";

export default Button;
