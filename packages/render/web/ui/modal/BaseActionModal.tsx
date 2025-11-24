// render/web/ui/BaseActionModal.tsx

import React, { useEffect, useRef, useCallback } from "react";
import { BaseModal } from "render/web/ui/modal/BaseModal"; // 假设路径

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
  width = 460, // 稍微加宽，增加大气感
  onEnterPress,
  isActionDisabled = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  // 自动聚焦逻辑 (保持不变)
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      if (!actionsRef.current) return;
      const buttons = actionsRef.current.querySelectorAll(
        "button:not([disabled])"
      );
      const lastButton = buttons[buttons.length - 1] as HTMLButtonElement;
      if (lastButton) lastButton.focus();
      else modalRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // 键盘事件处理 (保持不变)
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (isActionDisabled) return;
      if (event.key === "Enter" && onEnterPress) {
        const target = event.target as Element;
        const isInput = target.matches(
          'textarea, select, [contenteditable="true"]'
        );
        if (!isInput) {
          event.preventDefault();
          onEnterPress();
        }
      }
    },
    [onEnterPress, isActionDisabled]
  );

  useEffect(() => {
    const modalElement = modalRef.current;
    if (!isOpen || !modalElement) return;
    modalElement.addEventListener("keydown", handleKeyDown);
    return () => modalElement.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        variant="center"
        preventBodyScroll={true}
        className={`base-action-modal-root ${className} status-${status}`}
      >
        <div
          ref={modalRef}
          tabIndex={-1}
          className="action-modal-container"
          role="dialog"
          aria-modal="true"
          style={{ width: typeof width === "number" ? `${width}px` : width }}
        >
          {/* Header */}
          <div className="action-modal-header">
            <div className="title-wrapper">
              {titleIcon && <span className="title-icon">{titleIcon}</span>}
              <h3 className="modal-title">{title}</h3>
            </div>
            {headerExtra && <div className="header-extra">{headerExtra}</div>}
          </div>

          {/* Body */}
          <div className={`action-modal-body ${bodyClassName}`}>{children}</div>

          {/* Actions */}
          {actions && (
            <div ref={actionsRef} className="action-modal-actions">
              {actions}
            </div>
          )}
        </div>
      </BaseModal>

      <style href="base-action-modal" precedence="component">{`
        :global(.base-action-modal-root) {
          background-color: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          border: none !important;
          width: auto !important; 
          max-width: none !important; 
        }

        /* === 核心设计调整 === */
        .action-modal-container {
          display: flex;
          flex-direction: column;
          
          /* 1. 背景与材质：清爽、干净、微透 */
          background-color: var(--backgroundGhost); /* 使用带透明度的背景变量 */
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          
          /* 2. 形状：纤细 */
          border-radius: var(--space-4);
          
          /* 3. 拟物化细节 (40%)：
             - 1px 边框 (扁平)
             - 顶部白色高光 inset (拟物，提升精致感)
             - 柔和的深投影 (立体感)
          */
          box-shadow: 
            0 0 0 1px var(--borderLight),
            0 24px 48px -12px rgba(0, 0, 0, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.6); 
            
          /* 兜底边框，适配暗黑模式 */
          border: none; 

          max-height: 90vh;
          max-width: 90vw;
          overflow: hidden;
        }

        /* 暗黑模式下的高光调整 */
        @media (prefers-color-scheme: dark) {
          .action-modal-container {
             box-shadow: 
              0 0 0 1px var(--border),
              0 24px 48px -12px rgba(0, 0, 0, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.08); /* 暗色下的高光要极弱 */
          }
        }

        /* === 区域划分：去线留白 === */
        .action-modal-header {
          /* 移除 border-bottom，符合"尽量减少使用边框" */
          padding: var(--space-6) var(--space-6) var(--space-2); /* 下方留白减少，拉近标题与内容 */
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-4);
          flex-shrink: 0;
        }

        .title-wrapper {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          color: var(--text);
        }

        /* 状态色仅用于图标或文字强调，不过度渲染背景 */
        :global(.base-action-modal-root.status-error) .title-wrapper { color: var(--error); }
        :global(.base-action-modal-root.status-warning) .title-wrapper { color: var(--warning); }
        :global(.base-action-modal-root.status-success) .title-wrapper { color: var(--success); }
        :global(.base-action-modal-root.status-info) .title-wrapper { color: var(--info); }

        .modal-title {
          margin: 0;
          font-size: 18px; /* 字体稍微加大，提升易读性 */
          font-weight: 600;
          line-height: 1.4;
          letter-spacing: -0.01em; /* 现代感排版 */
        }

        .action-modal-body {
          /* 利用 Padding 形成呼吸感 */
          padding: var(--space-2) var(--space-6) var(--space-6); 
          flex: 1;
          overflow-y: auto;
          color: var(--textSecondary);
          font-size: 15px; /* 提升易读性 */
          line-height: 1.6;
        }

        .action-modal-actions {
          /* 移除 border-top */
          padding: 0 var(--space-6) var(--space-6); /* 包含在整体的底部留白中 */
          display: flex;
          justify-content: flex-end;
          gap: var(--space-3);
          flex-shrink: 0;
          flex-wrap: wrap;
        }

        /* 移动端适配 */
        @media (max-width: 640px) {
          .action-modal-container {
            width: 92vw !important;
            border-radius: var(--space-4); /* 保持圆角，不贴底 */
          }
          
          .action-modal-header {
             padding: var(--space-5) var(--space-5) var(--space-2);
          }
          
          .action-modal-body {
             padding: var(--space-2) var(--space-5) var(--space-5);
          }
          
          .action-modal-actions {
             padding: 0 var(--space-5) var(--space-5);
          }
        }
      `}</style>
    </>
  );
};

export default BaseActionModal;
