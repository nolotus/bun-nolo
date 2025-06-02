import React from "react";
import { useTheme } from "app/theme";
import { Link, LinkProps } from "react-router-dom";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  status?: "error";
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
      status,
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
    const buttonType = status === "error" ? "danger" : variant;
    const isDisabled = disabled || loading;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) return;
      onClick?.(e);
    };

    const commonProps = {
      className: `btn btn-${buttonType} btn-${size} ${block ? "btn-block" : ""} ${isDisabled ? "btn-disabled" : ""} ${className}`,
      disabled: isDisabled,
      onClick: handleClick,
      ref,
      ...rest,
    };

    if (Component === Link) {
      return (
        <>
          <Component
            {...commonProps}
            to={to || "#"}
            style={{ textDecoration: "none", display: "inline-flex" }}
          >
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
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen;
        font-weight: 500;
        line-height: 1;
        text-align: center;
        white-space: nowrap;
        vertical-align: middle;
        user-select: none;
        border-radius: ${theme.space[2]};
        border: none;
        cursor: pointer;
        transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        text-decoration: none;
        outline: none;
        /* 新拟物风格基础 */
        box-shadow:
          3px 3px 6px rgba(0, 0, 0, 0.1),
          -3px -3px 6px rgba(255, 255, 255, 0.1),
          0 0 0 1px ${theme.border};
        background-clip: padding-box;
      }

      /* 尺寸 */
      .btn-small {
        height: 32px;
        padding: 0 ${theme.space[3]};
        font-size: 13px;
        gap: ${theme.space[1]};
      }

      .btn-medium {
        height: 38px;
        padding: 0 ${theme.space[4]};
        font-size: 14px;
        gap: ${theme.space[2]};
      }

      .btn-large {
        height: 44px;
        padding: 0 ${theme.space[5]};
        font-size: 15px;
        gap: ${theme.space[2]};
      }

      .btn-block {
        width: 100%;
      }

      .btn-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: inherit;
      }

      .btn-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
      }

      .btn-text {
        line-height: 1;
        /* 文字轻微阴影增强立体感 */
        text-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
      }

      /* Primary 样式 - 新拟物设计 */
      .btn-primary {
        background: ${theme.primary};
        color: white;
        /* 顶部高光效果 */
        box-shadow:
          3px 3px 6px rgba(0, 0, 0, 0.15),
          -3px -3px 6px rgba(255, 255, 255, 0.1),
          0 0 0 1px ${theme.border},
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
      }

      .btn-primary:hover:not(.btn-disabled) {
        transform: translateY(-1px);
        box-shadow:
          4px 4px 8px rgba(0, 0, 0, 0.18),
          -4px -4px 8px rgba(255, 255, 255, 0.12),
          0 0 0 1px ${theme.border},
          inset 0 1px 0 rgba(255, 255, 255, 0.25);
      }

      .btn-primary:active:not(.btn-disabled) {
        transform: translateY(1px);
        transition-duration: 0.05s;
        /* 按下时的凹陷效果 */
        box-shadow:
          inset 2px 2px 4px rgba(0, 0, 0, 0.2),
          inset -2px -2px 4px rgba(255, 255, 255, 0.05),
          0 0 0 1px ${theme.border};
      }

      /* Secondary 样式 - 新拟物设计 */
      .btn-secondary {
        background: ${theme.backgroundTertiary};
        color: ${theme.text};
        box-shadow:
          3px 3px 6px rgba(0, 0, 0, 0.1),
          -3px -3px 6px rgba(255, 255, 255, 0.1),
          0 0 0 1px ${theme.border};
      }

      .btn-secondary:hover:not(.btn-disabled) {
        background: ${theme.backgroundSelected || theme.backgroundHover};
        transform: translateY(-1px);
        box-shadow:
          4px 4px 8px rgba(0, 0, 0, 0.12),
          -4px -4px 8px rgba(255, 255, 255, 0.08),
          0 0 0 1px ${theme.border};
      }

      .btn-secondary:active:not(.btn-disabled) {
        transform: translateY(1px);
        transition-duration: 0.05s;
        box-shadow:
          inset 2px 2px 4px rgba(0, 0, 0, 0.15),
          inset -2px -2px 4px rgba(255, 255, 255, 0.05),
          0 0 0 1px ${theme.border};
      }

      /* Ghost 样式 - 保持扁平但增强层次 */
      .btn-ghost {
        background: transparent;
        color: ${theme.textSecondary};
        box-shadow: none;
        border: 1px solid ${theme.border};
      }

      .btn-ghost:hover:not(.btn-disabled) {
        background: ${theme.backgroundHover};
        color: ${theme.text};
        box-shadow:
          0 2px 4px rgba(0, 0, 0, 0.05),
          inset 0 0 0 1px ${theme.border};
      }

      .btn-ghost:active:not(.btn-disabled) {
        background: ${theme.backgroundSelected || theme.backgroundHover};
        transition-duration: 0.05s;
        box-shadow:
          inset 0 2px 4px rgba(0, 0, 0, 0.05),
          inset 0 0 0 1px ${theme.border};
      }

      /* Danger 样式 */
      .btn-danger {
        background: ${theme.error};
        color: white;
        box-shadow:
          3px 3px 6px rgba(0, 0, 0, 0.15),
          -3px -3px 6px rgba(255, 255, 255, 0.1),
          0 0 0 1px ${theme.border},
          inset 0 1px 0 rgba(255, 255, 255, 0.2);
      }

      .btn-danger:hover:not(.btn-disabled) {
        filter: brightness(1.1);
        transform: translateY(-1px);
        box-shadow:
          4px 4px 8px rgba(0, 0, 0, 0.18),
          -4px -4px 8px rgba(255, 255, 255, 0.12),
          0 0 0 1px ${theme.border},
          inset 0 1px 0 rgba(255, 255, 255, 0.25);
      }

      .btn-danger:active:not(.btn-disabled) {
        filter: brightness(0.95);
        transform: translateY(1px);
        transition-duration: 0.05s;
        box-shadow:
          inset 2px 2px 4px rgba(0, 0, 0, 0.2),
          inset -2px -2px 4px rgba(255, 255, 255, 0.05),
          0 0 0 1px ${theme.border};
      }

      /* 禁用状态 */
      .btn-disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none !important;
        filter: none !important;
        box-shadow: none !important;
      }

      /* 焦点状态 - 新拟物风格 */
      .btn:focus-visible:not(.btn-disabled) {
        box-shadow:
          0 0 0 2px ${theme.background},
          0 0 0 4px ${theme.primary},
          3px 3px 6px rgba(0, 0, 0, 0.1),
          -3px -3px 6px rgba(255, 255, 255, 0.1);
      }

      /* 触摸设备优化 */
      @media (hover: none) and (pointer: coarse) {
        .btn:hover:not(.btn-disabled) {
          transform: none;
          box-shadow:
            3px 3px 6px rgba(0, 0, 0, 0.1),
            -3px -3px 6px rgba(255, 255, 255, 0.1),
            0 0 0 1px ${theme.border};
        }

        .btn:active:not(.btn-disabled) {
          transform: scale(0.98);
          transition-duration: 0.1s;
          box-shadow:
            inset 2px 2px 4px rgba(0, 0, 0, 0.15),
            inset -2px -2px 4px rgba(255, 255, 255, 0.05),
            0 0 0 1px ${theme.border};
        }
      }

      /* 减少动画偏好 */
      @media (prefers-reduced-motion: reduce) {
        .btn {
          transition: none;
        }

        .btn:hover:not(.btn-disabled) {
          transform: none;
        }

        .btn:active:not(.btn-disabled) {
          transform: none;
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
