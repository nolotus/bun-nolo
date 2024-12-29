// Button.tsx
import React from 'react';

import { useAppSelector } from 'app/hooks';
import { selectTheme } from 'app/theme/themeSlice';
import { createShadow } from "render/styles/createShadow";

import { animations } from "render/styles/animations";



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
  style?: React.CSSProperties;
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
  style,
  children,
}) => {
  const theme = useAppSelector(selectTheme)

  const shadows = {
    subtle: createShadow('#000000', {
      border: 0.04,
      blur1: 0.04,
      blur2: 0.04,
      borderHover: 0.04,
      blur1Hover: 0.06,
      blur2Hover: 0.05
    }),
    primary: createShadow(theme.primary, {
      border: 0.1,
      blur1: 0.08,
      blur2: 0.06,
      borderHover: 0.15,
      blur1Hover: 0.12,
      blur2Hover: 0.08
    }),
    danger: createShadow(theme.error, {
      border: 0.1,
      blur1: 0.08,
      blur2: 0.06,
      borderHover: 0.15,
      blur1Hover: 0.12,
      blur2Hover: 0.08
    })
  };
  const getButtonType = () => {
    if (status === 'error') return 'danger';
    return variant === 'primary' ? 'primary' : 'default';
  };

  const buttonType = getButtonType();
  const buttonClassName = `btn btn-${buttonType}${disabled || loading ? ' disabled' : ''} ${size} ${block ? 'block' : ''} ${className}`.trim();

  return (
    <button
      className={buttonClassName}
      disabled={disabled || loading}
      onClick={disabled || loading ? undefined : onClick}
      type={type}
      style={style}
    >
      <span className="btn-inner-wrapper">
        {icon && <span className="btn-icon">{icon}</span>}
        {loading ? (
          <span className="loading-wrapper">
            <LoadingSpinner />
          </span>
        ) : (
          <span className="btn-content">
            {children}
          </span>
        )}
      </span>

      <style jsx>{`
        .btn {
          font-size: 14px;
          font-weight: 500;
          border-radius: 8px;
          cursor: pointer;
          border: none;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          position: relative;
          backdrop-filter: blur(8px);
          user-select: none;
          transition: all ${animations.duration.normal} ${animations.spring};
          padding: 0 20px;
        }

        .btn.small {
          height: 28px;
          padding: 0 16px;
          font-size: 13px;
        }

        .btn.medium {
          height: 34px;
          padding: 0 20px;
          font-size: 14px;
        }

        .btn.large {
          height: 42px;
          padding: 0 28px;
          font-size: 15px;
        }

        .btn-inner-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          height: 100%;
          width: 100%;
        }

        .btn:hover:not(.disabled) {
          transform: translateY(-1px);
        }

        .btn-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          margin-right: 8px;
          transition: all ${animations.duration.normal} ${animations.spring};
        }

        .btn-content {
          display: flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
          transition: all ${animations.duration.normal} ${animations.spring};
        }

        .btn.disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-primary {
          background-color: ${theme.primary};
          color: ${theme.background};
          box-shadow: ${shadows.primary.default};
        }

        .btn-primary:hover:not(.disabled) {
          background-color: ${theme.hover};
          box-shadow: ${shadows.primary.hover};
        }

        .btn-danger {
          background-color: rgba(220, 38, 38, 0.06);
          color: ${theme.error};
          box-shadow: ${shadows.danger.default};
        }

        .btn-danger:hover:not(.disabled) {
          background-color: rgba(220, 38, 38, 0.06);
          box-shadow: ${shadows.danger.hover};
        }

        .btn-default {
          background-color: ${theme.backgroundSecondary};
          color: ${theme.text};
          box-shadow: ${shadows.subtle.default};
        }

        .btn-default:hover:not(.disabled) {
          background-color: ${theme.backgroundGhost};
          box-shadow: ${shadows.subtle.hover};
        }

        .block {
          width: 100%;
        }

        .loading-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};

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
