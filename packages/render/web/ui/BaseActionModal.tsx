// render/web/ui/BaseActionModal.tsx

import React, { useEffect, useState, useRef, useCallback } from "react";
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
  onEnterPress?: () => void;
  isActionDisabled?: boolean;
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
  onEnterPress,
  isActionDisabled = false,
}) => {
  const theme = useTheme();
  const [animateIn, setAnimateIn] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  const statusColor = {
    error: theme.error,
    warning: theme.warning || theme.primary,
    success: theme.success || theme.primary,
    info: theme.primary,
  }[status];

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setAnimateIn(true), 50);
      return () => clearTimeout(timer);
    }
    setAnimateIn(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const timer = setTimeout(() => {
      const firstButton = actionsRef.current?.querySelector(
        "button:not([disabled])"
      ) as HTMLButtonElement;
      if (firstButton) {
        firstButton.focus();
      } else {
        modalRef.current?.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (isActionDisabled) return;

      if (event.key === "Enter" && onEnterPress) {
        const target = event.target as Element;
        const isInput = target.matches(
          'input, textarea, select, [contenteditable="true"]'
        );
        if (!isInput) {
          event.preventDefault();
          onEnterPress();
        }
      }
    },
    [onClose, onEnterPress, isActionDisabled]
  );

  useEffect(() => {
    const modalElement = modalRef.current;
    if (!isOpen || !modalElement) return;

    modalElement.addEventListener("keydown", handleKeyDown);
    return () => {
      modalElement.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        variant="default"
        preventBodyScroll={true}
        className={`BaseActionModal-root ${className} ${animateIn ? "is-open" : ""}`}
      >
        <div
          ref={modalRef}
          tabIndex={-1}
          className="BaseActionModal-container"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="BaseActionModal-header">
            <div
              className="BaseActionModal-titleWrapper"
              style={{ color: statusColor }}
            >
              {titleIcon && (
                <span className="BaseActionModal-titleIcon">{titleIcon}</span>
              )}
              <h3 id="modal-title" className="BaseActionModal-title">
                {title}
              </h3>
            </div>
            {headerExtra && (
              <div className="BaseActionModal-headerExtra">{headerExtra}</div>
            )}
          </div>

          <div className={`BaseActionModal-body ${bodyClassName}`}>
            {children}
          </div>

          {actions && (
            <div ref={actionsRef} className="BaseActionModal-actions">
              {actions}
            </div>
          )}
        </div>
      </BaseModal>

      <style href="base-action-modal-styles" precedence="component">{`
        .BaseActionModal-root {
          background: var(--background);
          border-radius: 12px;
          box-shadow: 0 0 0 1px var(--border), 0 10px 15px -3px var(--shadowMedium), 0 4px 6px -4px var(--shadowLight);
          width: 100%;
          max-width: ${typeof width === "number" ? `${width}px` : width};
          margin: var(--space-8);
          overflow: hidden;
          opacity: 0;
          transform: scale(0.95) translateY(10px);
          transition: all 0.2s ease-out;
          outline: none;
        }

        .BaseActionModal-root.is-open {
          opacity: 1;
          transform: scale(1) translateY(0);
        }

        .BaseActionModal-container {
          display: flex;
          flex-direction: column;
          max-height: 90vh;
        }

        .BaseActionModal-header {
          padding: var(--space-4) var(--space-5);
          border-bottom: 1px solid var(--borderLight);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-4);
          flex-shrink: 0;
        }

        .BaseActionModal-titleWrapper {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          overflow: hidden;
        }

        .BaseActionModal-titleIcon {
          display: flex;
          align-items: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .BaseActionModal-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .BaseActionModal-headerExtra {
          flex-shrink: 0;
        }

        .BaseActionModal-body {
          /* Adjusted bottom padding to create space */
          padding: var(--space-5) var(--space-5) var(--space-2);
          flex: 1;
          overflow-y: auto;
          color: var(--textSecondary);
          font-size: 14px;
          line-height: 1.6;
          -webkit-overflow-scrolling: touch;
        }

        .BaseActionModal-actions {
          /* Cleaned up: removed border and background */
          padding: var(--space-4) var(--space-5); /* Adjusted padding for breathing room */
          display: flex;
          justify-content: flex-end;
          gap: var(--space-3);
          flex-shrink: 0;
        }

        @media (max-width: 640px) {
          .BaseActionModal-root {
            margin: 0;
            max-width: 100%;
            width: 100vw;
            height: 100vh;
            border-radius: 0;
            transform: translateY(100%);
          }
          .BaseActionModal-root.is-open {
            transform: translateY(0);
          }
          .BaseActionModal-container {
            max-height: 100vh;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .BaseActionModal-root {
            transition: opacity 0.2s ease-out;
            transform: none;
          }
        }
      `}</style>
    </>
  );
};

export default BaseActionModal;
