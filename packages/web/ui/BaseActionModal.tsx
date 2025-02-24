// web/ui/BaseActionModal.tsx
import React from "react";
import { BaseModal } from "./BaseModal";
import { useTheme } from "app/theme";

interface BaseActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions: React.ReactNode;
  status?: "info" | "warning" | "error" | "success";
  titleIcon?: React.ReactNode;
  headerExtra?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  width?: number | string;
}

export const BaseActionModal: React.FC<BaseActionModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  actions,
  status = "info",
  titleIcon,
  headerExtra,
  className = "",
  bodyClassName = "",
  width = 400,
}) => {
  const theme = useTheme();

  const getStatusColor = () => {
    switch (status) {
      case "error":
        return theme.error;
      case "warning":
        return theme.warning;
      case "success":
        return theme.success;
      default:
        return theme.primary;
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      className={`action-modal ${className}`}
    >
      <div className="modal-container">
        <div className="modal-header">
          <div className="title-wrapper">
            {titleIcon && <span className="title-icon">{titleIcon}</span>}
            <h3 className="title">{title}</h3>
          </div>
          {headerExtra && <div className="header-extra">{headerExtra}</div>}
        </div>

        <div className={`modal-body ${bodyClassName}`}>{children}</div>

        {actions && <div className="modal-actions">{actions}</div>}
      </div>

      <style jsx>{`
        .action-modal {
          background: ${theme.background};
          border-radius: 8px;
          box-shadow:
            0 20px 25px -5px rgb(0 0 0 / 0.1),
            0 8px 10px -6px rgb(0 0 0 / 0.1);
          width: 100%;
          max-width: ${typeof width === "number" ? `${width}px` : width};
          margin: 16px;
          overflow: hidden;
        }

        .modal-container {
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          padding: 16px 24px;
          border-bottom: 1px solid ${theme.border};
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .title-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          color: ${getStatusColor()};
        }

        .title-icon {
          display: flex;
          align-items: center;
          font-size: 20px;
        }

        .title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: ${theme.text};
        }

        .header-extra {
          flex-shrink: 0;
        }

        .modal-body {
          padding: 24px;
          flex: 1;
          overflow-y: auto;
        }

        .modal-actions {
          padding: 16px 24px;
          border-top: 1px solid ${theme.border};
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          background: ${theme.backgroundSecondary};
        }

        @media (max-width: 640px) {
          .action-modal {
            margin: 0;
            max-width: 100%;
            height: 100%;
            border-radius: 0;
          }

          .modal-container {
            height: 100%;
          }

          .modal-header {
            padding: 12px 16px;
          }

          .modal-body {
            padding: 16px;
          }

          .modal-actions {
            padding: 12px 16px;
          }
        }
      `}</style>
    </BaseModal>
  );
};
