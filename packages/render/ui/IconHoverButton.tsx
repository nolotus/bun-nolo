// IconHoverButton.tsx
import React from 'react';
import { animations } from "../styles/animations";
import { defaultTheme } from "../styles/colors";
import { shadows } from '../styles/shadow';

interface IconHoverButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  icon: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

export const IconHoverButton: React.FC<IconHoverButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  icon,
  disabled,
  onClick,
  className = '',
  children,
}) => {
  const sizeMap = {
    small: {
      height: 28,
      padding: 16,
      fontSize: 13
    },
    medium: {
      height: 34,
      padding: 20,
      fontSize: 14
    },
    large: {
      height: 42,
      padding: 28,
      fontSize: 15
    }
  };

  const { height, padding, fontSize } = sizeMap[size];

  return (
    <button
      className={`icon-hover-btn ${variant}${disabled ? ' disabled' : ''} ${className}`}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
    >
      <span className="inner-wrapper">
        <span className="icon">{icon}</span>
        <span className="content">{children}</span>
      </span>

      <style jsx>{`
        .icon-hover-btn {
          height: ${height}px;
          min-width: ${height}px;
          width: ${height}px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: ${fontSize}px;
          font-weight: 500;
          position: relative;
          backdrop-filter: blur(8px);
          transition: all ${animations.duration.normal} ${animations.spring};
          padding: 0;
          user-select: none;
        }

        .inner-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          width: 100%;
        }

        .icon {
          display: flex;
          margin-right: 0;
          transition: margin ${animations.duration.normal} ${animations.spring};
        }

        .content {
          max-width: 0;
          opacity: 0;
          overflow: hidden;
          white-space: nowrap;
          transform: translateX(-4px);
          transition: all ${animations.duration.normal} ${animations.spring};
        }

        .icon-hover-btn:hover:not(.disabled) {
          width: auto;
          padding: 0 ${padding}px;
          transform: translateY(-1px);
          transition: all ${animations.duration.normal} ${animations.bounce};
        }

        .icon-hover-btn:hover:not(.disabled) .icon {
          margin-right: 8px;
          transition: margin ${animations.duration.normal} ${animations.bounce};
        }

        .icon-hover-btn:hover:not(.disabled) .content {
          max-width: 200px;
          opacity: 1;
          transform: translateX(0);
          transition: all ${animations.duration.normal} ${animations.bounce};
        }

        .primary {
          background-color: ${defaultTheme.primary};
          color: ${defaultTheme.background};
          box-shadow: ${shadows.primary.default};
        }

        .primary:hover:not(.disabled) {
          background-color: ${defaultTheme.hover};
          box-shadow: ${shadows.primary.hover};
        }

        .secondary {
          background-color: ${defaultTheme.backgroundSecondary};
          color: ${defaultTheme.text};
          box-shadow: ${shadows.subtle.default};
        }

        .secondary:hover:not(.disabled) {
          background-color: ${defaultTheme.backgroundGhost};
          box-shadow: ${shadows.subtle.hover};
        }

        .danger {
          background-color: rgba(220, 38, 38, 0.06);
          color: ${defaultTheme.error};
          box-shadow: ${shadows.danger.default};
        }

        .danger:hover:not(.disabled) {
          background-color: rgba(220, 38, 38, 0.06);
          box-shadow: ${shadows.danger.hover};
        }

        .disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>
    </button>
  );
};

export default IconHoverButton;
