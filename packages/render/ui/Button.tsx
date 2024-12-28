import React from 'react';
import { defaultTheme } from "render/styles/colors";

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  status?: 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  block?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  status,
  size = 'medium',
  type = 'button',
  icon,
  loading,
  disabled,
  block,
  onClick,
  className = '',
  children,
}) => {
  // 获取按钮颜色
  const getButtonColor = () => {
    if (variant === 'secondary') return defaultTheme.backgroundSecondary;

    if (status) {
      return {
        error: defaultTheme.error,
        warning: defaultTheme.warning,
        success: defaultTheme.success
      }[status];
    }

    return defaultTheme.primary;
  };

  return (
    <button
      className={`button ${variant} ${size} ${block ? 'block' : ''} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
    >
      {loading ? (
        <span className="loading-wrapper">
          <LoadingSpinner />
        </span>
      ) : icon ? (
        <span className="icon-wrapper">{icon}</span>
      ) : null}

      <span className="content">{children}</span>

      <style href='button'>{`
        .button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: none;
          outline: none;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.2s ease;
          cursor: pointer;
          position: relative;
          white-space: nowrap;
        }

        .button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .button:focus-visible {
          box-shadow: 0 0 0 2px ${defaultTheme.primary}40;
        }

        .button:active:not(:disabled) {
          transform: scale(0.98);
        }

        /* Size variants */
        .small {
          min-width: 80px;
          height: 32px;
          padding: 0 16px;
          font-size: 13px;
        }

        .medium {
          min-width: 120px;
          height: 40px;
          padding: 0 24px;
          font-size: 14px;
        }

        .large {
          min-width: 140px;
          height: 48px;
          padding: 0 32px;
          font-size: 16px;
        }

        /* Style variants */
        .primary {
          background: ${getButtonColor()};
          color: white;
        }

        .primary:hover:not(:disabled) {
          opacity: 0.9;
        }

        .secondary {
          background: ${defaultTheme.backgroundSecondary};
          color: ${defaultTheme.text};
          border: 1px solid ${defaultTheme.border};
        }

        .secondary:hover:not(:disabled) {
          background: ${defaultTheme.backgroundGhost};
          border-color: ${defaultTheme.borderHover};
        }

        /* Block mode */
        .block {
          width: 100%;
        }

        /* Icon & Loading */
        .loading-wrapper,
        .icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-wrapper {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .content {
          line-height: 1;
        }
      `}</style>
    </button>
  );
};

// LoadingSpinner 组件
const LoadingSpinner = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13 7A6 6 0 111 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default Button;
