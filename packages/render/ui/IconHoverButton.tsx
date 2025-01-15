import React from "react";
import { createShadow } from "render/styles/createShadow";
import { useTheme } from "app/theme";

interface IconHoverButtonProps {
  variant?: "primary" | "secondary" | "danger";
  size?: "small" | "medium" | "large";
  icon: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

export const IconHoverButton: React.FC<IconHoverButtonProps> = ({
  variant = "primary",
  size = "medium",
  icon,
  disabled,
  onClick,
  className = "",
  children,
}) => {
  const theme = useTheme();
  const sizeMap = {
    small: {
      height: 28,
      padding: 16,
      fontSize: 13,
    },
    medium: {
      height: 34,
      padding: 20,
      fontSize: 14,
    },
    large: {
      height: 42,
      padding: 24, // 略微减小padding
      fontSize: 15,
    },
  };

  const shadows = {
    subtle: createShadow("#000000", {
      border: 0.04,
      blur1: 0.04,
      blur2: 0.04,
      borderHover: 0.04,
      blur1Hover: 0.05, // 减小阴影变化
      blur2Hover: 0.04,
    }),
    primary: createShadow(theme.primary, {
      border: 0.1,
      blur1: 0.08,
      blur2: 0.06,
      borderHover: 0.12, // 减小hover态阴影
      blur1Hover: 0.1,
      blur2Hover: 0.07,
    }),
    danger: createShadow(theme.error, {
      border: 0.1,
      blur1: 0.08,
      blur2: 0.06,
      borderHover: 0.12,
      blur1Hover: 0.1,
      blur2Hover: 0.07,
    }),
  };

  const { height, padding, fontSize } = sizeMap[size];

  return (
    <button
      className={`icon-hover-btn ${variant}${disabled ? " disabled" : ""} ${className}`}
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
          transition: all 180ms cubic-bezier(0.4, 0, 0.2, 1); // 使用更平滑的过渡
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
          transition: margin 180ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .content {
          max-width: 0;
          opacity: 0;
          overflow: hidden;
          white-space: nowrap;
          transform: translateX(-2px); // 减小位移
          transition: all 180ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .icon-hover-btn:hover:not(.disabled) {
          width: auto;
          padding: 0 ${padding}px;
          transform: translateY(-0.5px); // 减小上浮距离
        }

        .icon-hover-btn:hover:not(.disabled) .icon {
          margin-right: 6px; // 减小间距
        }

        .icon-hover-btn:hover:not(.disabled) .content {
          max-width: 200px;
          opacity: 1;
          transform: translateX(0);
        }

        /* 其他样式保持不变 */
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
