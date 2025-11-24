import { XIcon } from "@primer/octicons-react";
import React, { useEffect, useState } from "react";
import { BaseModal } from "./BaseModal";

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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const modalVariant = isMobile
    ? fullScreenOnMobile
      ? "fullscreen"
      : "slideUp"
    : "default";

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      variant={modalVariant}
      preventBodyScroll={true}
      className={`c-dialogRoot ${className}`}
    >
      <div className={`c-dialog c-dialog--size-${size}`}>
        {/* Header */}
        <div
          className={
            "c-dialog__header" +
            (showDivider ? " c-dialog__header--with-divider" : "")
          }
        >
          <h2 className="c-dialog__title">{title}</h2>
          <button
            className="c-dialog__close"
            onClick={onClose}
            aria-label="关闭对话框"
            type="button"
          >
            <XIcon size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="c-dialog__body">{children}</div>
      </div>

      <style href="dialog" precedence="medium">{`
        /*
         * 1. Root 容器：由 BaseModal 挂载
         */
        :global(.c-dialogRoot) {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          border: none !important;
          display: flex;
          justify-content: center;
        }

        /*
         * 2. Dialog 主体
         */
        .c-dialog {
          display: flex;
          flex-direction: column;
          background-color: var(--background);
          width: 100%;
          border-radius: var(--space-4);
          border: 1px solid var(--border);
          box-shadow: var(--shadowHeavy);
          max-height: 85vh;
          overflow: hidden;
          flex-shrink: 0;
        }

        /* 尺寸修饰符（PC） */
        .c-dialog--size-small { width: 400px; }
        .c-dialog--size-medium { width: 600px; }
        .c-dialog--size-large { width: 850px; }
        .c-dialog--size-xlarge { width: 1100px; }

        /*
         * 3. Header
         */
        .c-dialog__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4) var(--space-6);
          min-height: 64px;
          background-color: var(--background);
          z-index: 10;
        }

        .c-dialog__header--with-divider {
          border-bottom: 1px solid var(--border);
        }

        .c-dialog__title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          margin-right: var(--space-4);
        }

        .c-dialog__close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          padding: 0;
          background: transparent;
          border: 1px solid transparent;
          border-radius: var(--space-2);
          cursor: pointer;
          color: var(--textTertiary);
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .c-dialog__close:hover {
          background-color: var(--backgroundHover);
          color: var(--text);
        }

        .c-dialog__close:active {
          background-color: var(--backgroundSelected);
        }

        /*
         * 4. Body / Content
         */
        .c-dialog__body {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: var(--space-5) var(--space-6);
          color: var(--textSecondary);
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }

        .c-dialog__body::-webkit-scrollbar {
          width: 6px;
        }
        .c-dialog__body::-webkit-scrollbar-thumb {
          background-color: var(--border);
          border-radius: 3px;
        }
        .c-dialog__body::-webkit-scrollbar-track {
          background: transparent;
        }

        /*
         * 5. 全屏 & 底部抽屉模式适配
         * BaseModal 会在 root 上加 .fullscreen / .slideUp
         */
        :global(.c-dialogRoot.fullscreen) .c-dialog,
        :global(.c-dialogRoot.slideUp) .c-dialog {
          width: 100vw !important;
          max-width: none !important;
          height: 100% !important;
          max-height: none !important;
          border-radius: 0;
          border: none;
          box-shadow: none;
        }

        :global(.c-dialogRoot.slideUp) .c-dialog {
          border-radius: var(--space-4) var(--space-4) 0 0;
          height: auto !important;
          max-height: 90vh !important;
        }

        /*
         * 6. 移动端适配
         */
        @media (max-width: 640px) {
          .c-dialog--size-small,
          .c-dialog--size-medium,
          .c-dialog--size-large,
          .c-dialog--size-xlarge {
            width: 100%;
          }

          .c-dialog__header {
            padding: var(--space-3) var(--space-4);
            min-height: 56px;
          }

          .c-dialog__body {
            padding: var(--space-4);
          }

          .c-dialog__title {
            font-size: 16px;
          }
        }

        @media print {
          .c-dialogRoot { display: none; }
        }
      `}</style>
    </BaseModal>
  );
};

export default Dialog;
