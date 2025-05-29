import { XIcon } from "@primer/octicons-react";
import React from "react";
import { useTheme } from "app/theme";
import { BaseModal } from "render/web/ui/BaseModal";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  fullScreenOnMobile?: boolean;
  size?: "small" | "medium" | "large" | "xlarge";
  showDivider?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = "",
  fullScreenOnMobile = true,
  size = "medium",
  showDivider = false,
}) => {
  const theme = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return { width: "400px", minWidth: "400px", maxWidth: "400px" };
      case "large":
        return { width: "850px", minWidth: "700px", maxWidth: "850px" };
      case "xlarge":
        return { width: "1100px", minWidth: "900px", maxWidth: "1100px" };
      default:
        return { width: "650px", minWidth: "500px", maxWidth: "650px" };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      variant="default"
      preventBodyScroll={true}
    >
      <div className={`dialog-container ${className} size-${size}`}>
        <div className={`dialog-header ${showDivider ? "with-divider" : ""}`}>
          <h2 className="dialog-title">{title}</h2>
          <button
            className="dialog-close"
            onClick={onClose}
            aria-label="关闭对话框"
            type="button"
          >
            <XIcon size={16} />
          </button>
        </div>

        <div className="dialog-content">{children}</div>
      </div>

      <style href="dialog" precedence="medium">{`
        .dialog-container {
          display: flex;
          flex-direction: column;
          background: ${theme.background};
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          width: ${sizeStyles.width};
          min-width: ${sizeStyles.minWidth};
          max-width: ${sizeStyles.maxWidth};
          min-height: 200px;
          max-height: 92vh;
          border-radius: ${theme.space[4]};
          border: 1px solid ${theme.border};
          overflow: hidden;
          box-shadow: 
            0 25px 100px -12px rgba(0, 0, 0, 0.15),
            0 12px 40px -8px rgba(0, 0, 0, 0.08),
            0 0 0 1px ${theme.border};
          margin: ${theme.space[4]};
          box-sizing: border-box;
          position: relative;
          animation: dialog-enter 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes dialog-enter {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .dialog-container.size-large,
        .dialog-container.size-xlarge {
          max-height: 95vh;
        }

        .dialog-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: ${theme.space[6]} ${theme.space[6]} ${theme.space[5]};
          flex-shrink: 0;
          min-height: 72px;
          box-sizing: border-box;
          position: relative;
        }

        .dialog-header.with-divider::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: ${theme.space[6]};
          right: ${theme.space[6]};
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            ${theme.border} 20%,
            ${theme.border} 80%,
            transparent
          );
        }

        .dialog-title {
          font-size: 18px;
          font-weight: 600;
          color: ${theme.text};
          margin: 0;
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: calc(100% - 60px);
        }

        .dialog-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          padding: 0;
          background: none;
          border: none;
          border-radius: ${theme.space[2]};
          cursor: pointer;
          color: ${theme.textTertiary};
          transition: all 0.15s ease;
          flex-shrink: 0;
          touch-action: manipulation;
        }

        .dialog-close:hover {
          background: ${theme.backgroundHover};
          color: ${theme.textSecondary};
        }

        .dialog-close:active {
          transform: scale(0.95);
          background: ${theme.backgroundSelected};
        }

        .dialog-close:focus-visible {
          outline: 2px solid ${theme.primary};
          outline-offset: 1px;
        }

        .dialog-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          box-sizing: border-box;
          width: 100%;
        }

        .dialog-content::-webkit-scrollbar {
          width: 4px;
        }

        .dialog-content::-webkit-scrollbar-track {
          background: transparent;
          margin: ${theme.space[2]} 0;
        }

        .dialog-content::-webkit-scrollbar-thumb {
          background: ${theme.border};
          border-radius: 2px;
          transition: background 0.15s ease;
        }

        .dialog-content::-webkit-scrollbar-thumb:hover {
          background: ${theme.borderHover};
        }

        @media (min-width: 1400px) {
          .dialog-container.size-medium {
            width: 700px;
            min-width: 700px;
            max-width: 700px;
          }
          
          .dialog-container.size-large {
            width: 950px;
            min-width: 950px;
            max-width: 950px;
          }
          
          .dialog-container.size-xlarge {
            width: 1200px;
            min-width: 1200px;
            max-width: 1200px;
          }
        }

        @media (max-width: 1250px) {
          .dialog-container.size-xlarge {
            width: 92vw;
            min-width: 800px;
            max-width: 92vw;
          }
        }

        @media (max-width: 950px) {
          .dialog-container.size-large,
          .dialog-container.size-xlarge {
            width: 90vw;
            min-width: 600px;
            max-width: 90vw;
          }
        }

        @media (max-width: 750px) {
          .dialog-container {
            width: 92vw !important;
            min-width: 350px;
            max-width: 92vw !important;
            margin: ${theme.space[3]};
            border-radius: ${theme.space[3]};
          }

          .dialog-header {
            padding: ${theme.space[5]} ${theme.space[5]} ${theme.space[4]};
            min-height: 64px;
          }

          .dialog-header.with-divider::after {
            left: ${theme.space[5]};
            right: ${theme.space[5]};
          }

          .dialog-title {
            font-size: 17px;
          }
        }

        @media (max-width: 640px) {
          .dialog-container {
            width: 100vw !important;
            min-width: 100vw !important;
            max-width: 100vw !important;
            height: 100vh;
            max-height: 100vh;
            border-radius: 0;
            margin: 0;
            border: none;
            box-shadow: none;
          }

          .dialog-header {
            padding: ${theme.space[4]};
            min-height: 60px;
            border-bottom: 1px solid ${theme.border};
          }

          .dialog-header.with-divider::after {
            display: none;
          }

          .dialog-title {
            font-size: 16px;
            max-width: calc(100% - 50px);
          }

          .dialog-close {
            width: 40px;
            height: 40px;
          }
        }

        @media (max-width: 480px) {
          .dialog-header {
            padding: ${theme.space[3]};
            min-height: 56px;
          }

          .dialog-title {
            font-size: 15px;
          }

          .dialog-close {
            width: 36px;
            height: 36px;
          }
        }

        @media (max-width: 640px) and (orientation: landscape) and (max-height: 500px) {
          .dialog-header {
            padding: ${theme.space[2]} ${theme.space[4]};
            min-height: 44px;
          }

          .dialog-title {
            font-size: 14px;
          }

          .dialog-close {
            width: 32px;
            height: 32px;
          }
        }

        @media (hover: none) and (pointer: coarse) {
          .dialog-close:hover {
            background: transparent;
            color: ${theme.textTertiary};
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .dialog-container {
            animation: none;
          }
          
          .dialog-close {
            transition: none;
          }
          
          .dialog-close:active {
            transform: none;
          }

          .dialog-container {
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
          }
        }

        @media (min-resolution: 2dppx) {
          .dialog-container {
            box-shadow: 
              0 25px 100px -12px rgba(0, 0, 0, 0.2),
              0 12px 40px -8px rgba(0, 0, 0, 0.12),
              0 0 0 1px ${theme.border};
          }
        }
      `}</style>
    </BaseModal>
  );
};

export default Dialog;
