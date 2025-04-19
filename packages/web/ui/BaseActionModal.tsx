import React, { useEffect, useState } from "react";
import { BaseModal } from "render/web/ui/BaseModal";

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
  const [animateIn, setAnimateIn] = useState(false);
  const { space: sp } = theme;

  // 用于处理入场动画
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setAnimateIn(true), 50);
      return () => clearTimeout(timer);
    } else {
      setAnimateIn(false);
    }
  }, [isOpen]);

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
      className={`action-modal ${className} ${animateIn ? "animate-in" : ""}`}
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

      <style href="base-action-modal">{`
        .action-modal {
          background: ${theme.background};
          border-radius: 12px;
          box-shadow:
            0 10px 15px -3px ${theme.shadowLight},
            0 4px 6px -2px ${theme.shadowMedium};
          width: 100%;
          max-width: ${typeof width === "number" ? `${width}px` : width};
          margin: ${sp[4]};
          overflow: hidden;
          opacity: 0;
          transform: scale(0.95) translateY(10px);
          transition: all 0.2s ease-out;
        }

        .action-modal.animate-in {
          opacity: 1;
          transform: scale(1) translateY(0);
        }

        .modal-container {
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          padding: ${sp[5]} ${sp[6]} ${sp[4]};
          border-bottom: 1px solid ${theme.backgroundTertiary};
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: ${sp[4]};
        }

        .title-wrapper {
          display: flex;
          align-items: center;
          gap: ${sp[2]};
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
          letter-spacing: -0.01em;
        }

        .header-extra {
          flex-shrink: 0;
        }

        .modal-body {
          padding: ${sp[6]} ${sp[6]} ${sp[4]};
          flex: 1;
          overflow-y: auto;
          color: ${theme.textSecondary};
          font-size: 14px;
          line-height: 1.6;
        }

        .modal-actions {
          padding: ${sp[2]} ${sp[6]} ${sp[6]};
          display: flex;
          justify-content: flex-end;
          gap: ${sp[3]};
        }

        @media (max-width: 640px) {
          .action-modal {
            margin: 0;
            max-width: 100%;
            height: 100%;
            border-radius: 0;
            transform: translateY(20px);
          }

          .action-modal.animate-in {
            transform: translateY(0);
          }

          .modal-container {
            height: 100%;
          }

          .modal-header {
            padding: ${sp[4]} ${sp[4]} ${sp[3]};
          }

          .modal-body {
            padding: ${sp[4]} ${sp[4]} ${sp[2]};
          }

          .modal-actions {
            padding: ${sp[2]} ${sp[4]} ${sp[5]};
            margin-top: auto;
          }
        }
      `}</style>
    </BaseModal>
  );
};
