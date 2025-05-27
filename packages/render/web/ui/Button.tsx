// render/web/ui/Button.tsx
import React from "react";
import { useTheme } from "app/theme";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  status?: "error";
  size?: "small" | "medium" | "large";
  icon?: React.ReactNode;
  loading?: boolean;
  block?: boolean;
  type?: "button" | "submit" | "reset";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
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
      ...rest
    },
    ref
  ) => {
    const theme = useTheme();

    const buttonType = status === "error" ? "danger" : variant;
    const isDisabled = disabled || loading;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) return;
      onClick?.(e);
    };

    return (
      <>
        <button
          {...rest}
          ref={ref}
          className={`btn btn-${buttonType} btn-${size} ${block ? "btn-block" : ""} ${isDisabled ? "btn-disabled" : ""} ${className}`}
          disabled={isDisabled}
          onClick={handleClick}
          type={type}
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
        </button>

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
          }

          /* Primary 样式 - 极简设计 */
          .btn-primary {
            background: ${theme.primary};
            color: white;
          }

          .btn-primary:hover:not(.btn-disabled) {
            background: ${theme.primaryLight || theme.primary};
            transform: translateY(-1px);
          }

          .btn-primary:active:not(.btn-disabled) {
            transform: translateY(0);
            transition-duration: 0.05s;
          }

          /* Secondary 样式 - 去除边框，使用背景色差异 */
          .btn-secondary {
            background: ${theme.backgroundTertiary};
            color: ${theme.text};
          }

          .btn-secondary:hover:not(.btn-disabled) {
            background: ${theme.backgroundSelected || theme.backgroundHover};
            transform: translateY(-1px);
          }

          .btn-secondary:active:not(.btn-disabled) {
            background: ${theme.backgroundTertiary};
            transform: translateY(0);
            transition-duration: 0.05s;
          }

          /* Ghost 样式 - 极简透明按钮 */
          .btn-ghost {
            background: transparent;
            color: ${theme.textSecondary};
          }

          .btn-ghost:hover:not(.btn-disabled) {
            background: ${theme.backgroundHover};
            color: ${theme.text};
          }

          .btn-ghost:active:not(.btn-disabled) {
            background: ${theme.backgroundSelected || theme.backgroundHover};
            transition-duration: 0.05s;
          }

          /* Danger 样式 */
          .btn-danger {
            background: ${theme.error};
            color: white;
          }

          .btn-danger:hover:not(.btn-disabled) {
            filter: brightness(1.1);
            transform: translateY(-1px);
          }

          .btn-danger:active:not(.btn-disabled) {
            filter: brightness(0.95);
            transform: translateY(0);
            transition-duration: 0.05s;
          }

          /* 禁用状态 */
          .btn-disabled {
            opacity: 0.4;
            cursor: not-allowed;
            transform: none !important;
            filter: none !important;
          }

          /* 焦点状态 - 极简无障碍设计 */
          .btn:focus-visible:not(.btn-disabled) {
            box-shadow: 0 0 0 2px ${theme.background}, 0 0 0 4px ${theme.primary};
          }

          /* 触摸设备优化 */
          @media (hover: none) and (pointer: coarse) {
            .btn:hover:not(.btn-disabled) {
              transform: none;
            }
            
            .btn:active:not(.btn-disabled) {
              transform: scale(0.98);
              transition-duration: 0.1s;
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
      </>
    );
  }
);

Button.displayName = "Button";

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

export default Button;
