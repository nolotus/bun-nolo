// IconHoverButton.tsx
import React from 'react';

import { createShadow } from "render/styles/createShadow";
import { animations } from "../styles/animations";
import { useTheme } from 'app/theme';


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
  const theme = useTheme();
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
          background-color: ${theme.primary};
          color: ${theme.background};
          box-shadow: ${shadows.primary.default};
        }

        .primary:hover:not(.disabled) {
          background-color: ${theme.hover};
          box-shadow: ${shadows.primary.hover};
        }

        .secondary {
          background-color: ${theme.backgroundSecondary};
          color: ${theme.text};
          box-shadow: ${shadows.subtle.default};
        }

        .secondary:hover:not(.disabled) {
          background-color: ${theme.backgroundGhost};
          box-shadow: ${shadows.subtle.hover};
        }

        .danger {
          background-color: rgba(220, 38, 38, 0.06);
          color: ${theme.error};
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
