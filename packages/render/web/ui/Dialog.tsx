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
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = "",
}) => {
  const theme = useTheme();

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className={`dialog-container ${className}`}>
        <div className="dialog-header">
          <h2 className="dialog-title">{title}</h2>
          <button
            className="dialog-close"
            onClick={onClose}
            aria-label="Close dialog"
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
          width: 600px;
          min-height: 200px;
          max-height: 90vh;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 24px ${theme.shadowMedium};
        }

        .dialog-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid ${theme.border};
        }

        .dialog-title {
          font-size: 18px;
          font-weight: 600;
          color: ${theme.text};
          margin: 0;
          line-height: 1.4;
        }

        .dialog-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          padding: 0;
          background: none;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          color: ${theme.textSecondary};
          transition: all 0.2s ease;
        }

        .dialog-close:hover {
          background-color: ${theme.backgroundGhost};
          color: ${theme.text};
        }

        .dialog-close:active {
          transform: scale(0.95);
        }

        .dialog-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .dialog-content::-webkit-scrollbar {
          width: 8px;
        }

        .dialog-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .dialog-content::-webkit-scrollbar-thumb {
          background-color: ${theme.border};
          border-radius: 4px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        .dialog-content::-webkit-scrollbar-thumb:hover {
          background-color: ${theme.borderHover};
        }

        @media (min-width: 1601px) {
          .dialog-container {
            width: 1100px;
          }
        }

        @media (max-width: 1600px) {
          .dialog-container {
            width: 900px;
          }

          .dialog-title {
            font-size: 20px;
          }

          .dialog-content {
            padding: 28px;
          }
        }

        @media (max-width: 1200px) {
          .dialog-container {
            width: 800px;
          }
        }

        @media (max-width: 1024px) {
          .dialog-container {
            width: 720px;
          }
        }

        @media (max-width: 768px) {
          .dialog-container {
            width: 90%;
            max-width: 600px;
          }

          .dialog-header {
            padding: 18px 20px;
          }

          .dialog-content {
            padding: 20px;
          }
        }

        @media (max-width: 480px) {
          .dialog-container {
            width: 100%;
            min-width: 320px;
            height: 100%;
            max-height: 100vh;
            border-radius: 0;
          }

          .dialog-header {
            padding: 16px;
          }

          .dialog-title {
            font-size: 16px;
          }

          .dialog-close {
            width: 28px;
            height: 28px;
          }

          .dialog-content {
            padding: 16px;
          }
        }

        @media (min-height: 1000px) {
          .dialog-container {
            max-height: 85vh;
          }
        }

        @media (max-height: 600px) {
          .dialog-header {
            padding: 12px 16px;
          }

          .dialog-content {
            padding: 16px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .dialog-close {
            transition: none;
          }
        }
      `}</style>
    </BaseModal>
  );
};

export default Dialog;
