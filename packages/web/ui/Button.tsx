// web/ui/Button.tsx
import React from "react";
import { useTheme } from "app/theme";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
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
      className,
      children,
      style,
      onClick,
      ...rest
    },
    ref
  ) => {
    const theme = useTheme();

    const buttonType = status === "error" ? "danger" : variant;
    const buttonClassName = `btn btn-${buttonType}${disabled || loading ? " disabled" : ""} ${size}${block ? " block" : ""} ${className || ""}`;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) return;
      onClick?.(e);
    };

    return (
      <button
        {...rest}
        ref={ref}
        className={buttonClassName}
        disabled={disabled || loading}
        onClick={handleClick}
        style={style}
        type={type}
      >
        <span className="btn-content">
          {icon && !loading && <span className="btn-icon">{icon}</span>}
          {loading ? <LoadingSpinner /> : children}
        </span>

        <style href="button">{`
        .btn {
          position: relative;
          font-size: 14px;
          line-height: 1.5;
          font-weight: 500;
          border-radius: 8px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid transparent;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          user-select: none;
          white-space: nowrap;
          outline: none;
          letter-spacing: 0.01em;
        }

        .btn:focus-visible {
          box-shadow: 0 0 0 3px ${theme.background}, 0 0 0 6px ${theme.primaryGhost};
        }

        .block {
          width: 100%;
          display: flex;
        }

        .small { 
          height: 32px; 
          padding: 0 14px; 
          font-size: 13px; 
        }

        .medium { 
          height: 38px; 
          padding: 0 18px; 
        }

        .large { 
          height: 44px; 
          padding: 0 24px; 
          font-size: 15px; 
        }

        .btn:hover:not(.disabled) {
          transform: translateY(-1px);
        }

        .btn:active:not(.disabled) {
          transform: translateY(0);
        }

        .btn-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-icon {
          display: flex;
          align-items: center;
          font-size: 1.15em;
        }

        .disabled {
          opacity: 0.5;
          cursor: not-allowed;
          filter: grayscale(20%);
        }

        /* Primary Button */
        .btn-primary {
          background: ${theme.primary};
          color: white;
          box-shadow: 0 2px 6px ${theme.primaryGhost}, 0 1px 2px rgba(0, 0, 0, 0.04);
        }

        .btn-primary:hover:not(.disabled) {
          background: ${theme.primaryLight};
          box-shadow: 0 4px 12px ${theme.primaryGhost}, 0 2px 4px rgba(0, 0, 0, 0.04);
        }

        .btn-primary:active:not(.disabled) {
          box-shadow: 0 2px 4px ${theme.primaryGhost};
          background: ${theme.primary};
        }

        /* Secondary Button */
        .btn-secondary {
          background: ${theme.backgroundSecondary};
          color: ${theme.text};
          border: 1px solid ${theme.border};
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        }

        .btn-secondary:hover:not(.disabled) {
          border-color: ${theme.borderHover};
          background: ${theme.backgroundGhost};
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
        }

        .btn-secondary:active:not(.disabled) {
          background: ${theme.backgroundSecondary};
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        }

        /* Danger Button */
        .btn-danger {
          background: ${theme.error};
          color: white;
          box-shadow: 0 2px 6px rgba(239, 68, 68, 0.25);
        }

        .btn-danger:hover:not(.disabled) {
          filter: brightness(1.05);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
        }

        .btn-danger:active:not(.disabled) {
          filter: brightness(0.95);
          box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
        }

        @keyframes spin {
          to { 
            transform: rotate(360deg); 
          }
        }

        :global(.loading) {
          animation: spin 0.8s linear infinite;
          margin-right: 2px;
        }
      `}</style>
      </button>
    );
  }
);

Button.displayName = "Button";

const LoadingSpinner = () => (
  <svg
    className="loading"
    width="16"
    height="16"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="7"
      cy="7"
      r="6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.2"
    />
    <path
      d="M13 7A6 6 0 111 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default Button;
