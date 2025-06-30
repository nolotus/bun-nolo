// render/web/ui/BaseActionModal.tsx
import React, { useEffect, useState, useRef } from "react";
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
  const { space: sp } = theme;
  const modalRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  // 入场动画逻辑
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setAnimateIn(true), 50);
      return () => clearTimeout(timer);
    } else {
      setAnimateIn(false);
    }
  }, [isOpen]);

  // 焦点管理 - 优化版本
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const timer = setTimeout(() => {
        // 优先聚焦到第一个可操作的按钮
        const firstButton = actionsRef.current?.querySelector(
          "button:not([disabled])"
        ) as HTMLButtonElement;
        if (firstButton) {
          firstButton.focus();
        } else {
          modalRef.current?.focus();
        }
      }, 100); // 增加延时确保动画完成
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // 键盘事件监听 - 优化版本
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // 检查事件是否来自当前弹窗内部
      const target = event.target as Element;
      if (!modalRef.current?.contains(target)) {
        return;
      }

      if (isActionDisabled) {
        // 即使禁用状态也允许 ESC 关闭
        if (event.key === "Escape") {
          event.preventDefault();
          onClose();
        }
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }

      if (event.key === "Enter" && onEnterPress) {
        // 排除在表单元素内的回车
        if (
          !(target instanceof HTMLButtonElement) &&
          !(target instanceof HTMLInputElement) &&
          !(target instanceof HTMLTextAreaElement) &&
          !(target instanceof HTMLSelectElement)
        ) {
          event.preventDefault();
          onEnterPress();
        }
      }
    };

    // 绑定到弹窗容器而不是 document
    modalRef.current?.addEventListener("keydown", handleKeyDown);

    return () => {
      modalRef.current?.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, onEnterPress, isActionDisabled]);

  const getStatusColor = () => {
    switch (status) {
      case "error":
        return theme.error;
      case "warning":
        return theme.warning || theme.primary;
      case "success":
        return theme.success || theme.primary;
      default:
        return theme.primary;
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      variant="default"
      preventBodyScroll={true}
      className={`action-modal ${className} ${animateIn ? "animate-in" : ""}`}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="modal-container"
        style={{ outline: "none" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <div className="title-wrapper">
            {titleIcon && <span className="title-icon">{titleIcon}</span>}
            <h3 id="modal-title" className="title">
              {title}
            </h3>
          </div>
          {headerExtra && <div className="header-extra">{headerExtra}</div>}
        </div>

        <div className={`modal-body ${bodyClassName}`}>{children}</div>

        {actions && (
          <div ref={actionsRef} className="modal-actions">
            {actions}
          </div>
        )}
      </div>

      <style jsx>{`
        .action-modal {
          background: var(--background);
          border-radius: 12px;
          box-shadow:
            0 0 0 1px var(--border),
            0 10px 15px -3px var(--shadowLight),
            0 4px 6px -2px var(--shadowMedium);
          width: 100%;
          max-width: ${typeof width === "number" ? `${width}px` : width};
          margin: var(--space-4);
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
          padding: var(--space-5) var(--space-6) var(--space-4);
          border-bottom: 1px solid var(--backgroundTertiary);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-4);
        }

        .title-wrapper {
          display: flex;
          align-items: center;
          gap: var(--space-2);
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
          color: var(--text);
          letter-spacing: -0.01em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: calc(100% - 32px);
        }

        .header-extra {
          flex-shrink: 0;
        }

        .modal-body {
          padding: var(--space-6) var(--space-6) var(--space-4);
          flex: 1;
          overflow-y: auto;
          color: var(--textSecondary);
          font-size: 14px;
          line-height: 1.6;
          -webkit-overflow-scrolling: touch;
        }

        .modal-actions {
          padding: var(--space-2) var(--space-6) var(--space-6);
          display: flex;
          justify-content: flex-end;
          gap: var(--space-3);
        }

        /* 移动端优化 */
        @media (max-width: 640px) {
          .action-modal {
            margin: 0;
            max-width: 100%;
            width: 100vw;
            height: 100vh;
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
            padding: var(--space-4);
          }

          .title {
            font-size: 16px;
          }

          .modal-body {
            padding: var(--space-4);
            height: calc(100vh - 140px);
          }

          .modal-actions {
            padding: var(--space-3) var(--space-4) var(--space-5);
            margin-top: auto;
          }
        }

        /* 平板端优化 */
        @media (max-width: 768px) and (min-width: 641px) {
          .action-modal {
            margin: var(--space-4);
            max-width: 90%;
          }
        }

        /* 无障碍支持 */
        @media (prefers-reduced-motion: reduce) {
          .action-modal {
            transition: none;
          }
        }
      `}</style>
    </BaseModal>
  );
};

export default BaseActionModal;
