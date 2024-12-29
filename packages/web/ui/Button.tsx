// web/ui/Button.tsx
import React from 'react';
import { useTheme } from 'app/theme';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  status?: 'error';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  block?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  status,
  size = 'medium',
  icon,
  loading,
  disabled,
  block,
  style,
  onClick,
  children,
}) => {
  const theme = useTheme();

  const buttonType = status === 'error' ? 'danger' : variant;
  const buttonClassName = `btn btn-${buttonType}${disabled || loading ? ' disabled' : ''} ${size}${block ? ' block' : ''}`;

  return (
    <button
      className={buttonClassName}
      disabled={disabled || loading}
      onClick={disabled || loading ? undefined : onClick}
      style={style}
    >
      <span className="btn-content">
        {icon && <span className="btn-icon">{icon}</span>}
        {loading ? <LoadingSpinner /> : children}
      </span>

      <style href="button">{`
        .btn {
          font-size: 14px;
          font-weight: 500;
          border-radius: 6px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid transparent;
          transition: all 0.15s ease;
          user-select: none;
        }

        .block {
          width: 100%;
          display: flex;
        }

        .small { height: 28px; padding: 0 12px; font-size: 13px; }
        .medium { height: 34px; padding: 0 16px; }
        .large { height: 42px; padding: 0 24px; font-size: 15px; }

        .btn:hover:not(.disabled) {
          transform: translateY(-1px);
        }

        .btn:active:not(.disabled) {
          transform: none;
        }

        .btn-content {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: ${theme.primary};
          color: white;
          box-shadow: 0 2px 4px ${theme.primaryGhost};
        }

        .btn-primary:hover:not(.disabled) {
          background: ${theme.primaryLight};
          box-shadow: 0 4px 8px ${theme.primaryGhost};
        }

        .btn-secondary {
          background: ${theme.backgroundSecondary};
          color: ${theme.text};
          border: 1px solid ${theme.border};
        }

        .btn-secondary:hover:not(.disabled) {
          border-color: ${theme.borderHover};
          background: ${theme.backgroundGhost};
        }

        .btn-danger {
          background: ${theme.error};
          color: white;
        }

        .btn-danger:hover:not(.disabled) {
          filter: brightness(1.1);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading {
          animation: spin 0.6s linear infinite;
        }
      `}</style>
    </button>
  );
};

const LoadingSpinner = () => (
  <svg
    className="loading"
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
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
