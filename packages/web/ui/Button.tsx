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
          font-weight: 500;
          border-radius: 6px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid transparent;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          user-select: none;
          white-space: nowrap;
          outline: none;
        }


        .btn:focus-visible {
          box-shadow: 0 0 0 2px ${theme.background}, 0 0 0 4px ${theme.primaryGhost};
        }


        .block {
          width: 100%;
          display: flex;
        }


        .small { 
          height: 28px; 
          padding: 0 12px; 
          font-size: 13px; 
        }


        .medium { 
          height: 34px; 
          padding: 0 16px; 
        }


        .large { 
          height: 42px; 
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
          gap: 6px;
        }


        .btn-icon {
          display: flex;
          align-items: center;
          font-size: 1.1em;
        }


        .disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }


        /* Primary Button */
        .btn-primary {
          background: ${theme.primary};
          color: white;
          box-shadow: 0 2px 4px ${theme.primaryGhost};
        }


        .btn-primary:hover:not(.disabled) {
          background: ${theme.primaryLight};
          box-shadow: 0 4px 8px ${theme.primaryGhost};
        }


        .btn-primary:active:not(.disabled) {
          box-shadow: 0 2px 4px ${theme.primaryGhost};
        }


        /* Secondary Button */
        .btn-secondary {
          background: ${theme.backgroundSecondary};
          color: ${theme.text};
          border: 1px solid ${theme.border};
        }


        .btn-secondary:hover:not(.disabled) {
          border-color: ${theme.borderHover};
          background: ${theme.backgroundGhost};
        }


        .btn-secondary:active:not(.disabled) {
          background: ${theme.backgroundSecondary};
        }


        /* Danger Button */
        .btn-danger {
          background: ${theme.error};
          color: white;
          box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
        }


        .btn-danger:hover:not(.disabled) {
          filter: brightness(1.1);
          box-shadow: 0 4px 8px rgba(239, 68, 68, 0.2);
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
  animation: spin 1s linear infinite;
  margin-right: 4px;
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
    width="14"
    height="14"
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
      opacity="0.25"
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
