// Button.tsx
import React from 'react';
import { createShadow } from "render/styles/createShadow";
import { animations } from "render/styles/animations";
import { useTheme } from 'app/theme';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
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
  const theme = useTheme();

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

  const getButtonStyles = () => {
    if (status === 'error') {
      return {
        background: 'rgba(220, 38, 38, 0.06)',
        color: theme.error,
        shadow: shadows.danger.default,
        hoverShadow: shadows.danger.hover,
        hoverBackground: 'rgba(220, 38, 38, 0.08)'
      };
    }

    switch (variant) {
      case 'primary':
        return {
          background: theme.primary,
          color: theme.background,
          shadow: shadows.primary.default,
          hoverShadow: shadows.primary.hover,
          hoverBackground: theme.primaryLight
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: theme.text,
          shadow: 'none',
          hoverShadow: 'none',
          hoverBackground: theme.backgroundSecondary
        };
      default:
        return {
          background: theme.backgroundSecondary,
          color: theme.text,
          shadow: shadows.subtle.default,
          hoverShadow: shadows.subtle.hover,
          hoverBackground: theme.backgroundGhost
        };
    }
  };

  const buttonStyles = getButtonStyles();
  const buttonClassName = `btn ${variant} ${size}${disabled || loading ? ' disabled' : ''} ${block ? 'block' : ''} ${className}`.trim();

  return (
    <button
      className={buttonClassName}
      disabled={disabled || loading}
      onClick={disabled || loading ? undefined : onClick}
      type={type}
      style={style}
    >
      <span className="btn-inner">
        {icon && <span className="btn-icon">{icon}</span>}
        {loading ? (
          <span className="loading-wrapper">
            <LoadingSpinner />
          </span>
        ) : (
          <span className="btn-content">{children}</span>
        )}
      </span>

      <style >{`
        .btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: ${size === 'small' ? '28px' : size === 'large' ? '42px' : '34px'};
          padding: ${size === 'small' ? '0 16px' : size === 'large' ? '0 28px' : '0 20px'};
          font-size: ${size === 'small' ? '13px' : size === 'large' ? '15px' : '14px'};
          font-weight: 500;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          user-select: none;
          white-space: nowrap;
          backdrop-filter: blur(8px);
          background: ${buttonStyles.background};
          color: ${buttonStyles.color};
          box-shadow: ${buttonStyles.shadow};
          transition: all ${animations.duration.normal} ${animations.spring};
        }

        .btn:hover:not(.disabled) {
          transform: translateY(-1px);
          background: ${buttonStyles.hoverBackground};
          box-shadow: ${buttonStyles.hoverShadow};
        }

        .btn.disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          animation: spin 1s linear infinite;
        }

        .block {
          width: 100%;
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
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M13 7A6 6 0 111 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default Button;
