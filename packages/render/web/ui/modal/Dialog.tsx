// render/web/ui/modal/Dialog.tsx
import { XIcon } from "@primer/octicons-react";
import React from "react";
import { BaseModal } from "./BaseModal";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode; // 允许传入组件（如带图标的标题）
  children: React.ReactNode;
  className?: string;
  size?: "small" | "medium" | "large" | "xlarge" | "full";
  noPadding?: boolean; // 新增：允许内容贴边（适合图片/文档预览）
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = "",
  size = "medium",
  noPadding = false,
}) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      variant="default" // PC端居中，BaseModal内部会处理移动端 SlideUp
      className={`c-dialogRoot ${className}`}
    >
      <div className={`c-dialog size-${size}`}>
        {/* Header - Sticky */}
        <div className="c-dialog__header">
          <div className="c-dialog__title">{title}</div>
          <button className="c-dialog__close" onClick={onClose} type="button">
            <XIcon size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className={`c-dialog__body ${noPadding ? "no-padding" : ""}`}>
          {children}
        </div>
      </div>

      <style href="dialog-styles" precedence="high">{`
        /* 这里的 BaseModal children (modal-content) 不需要默认背景，背景给 c-dialog */
        :global(.modal-content.default), 
        :global(.modal-content.slideUp) {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
          display: flex; /* 关键：为了让 c-dialog 撑开 */
          justify-content: center;
        }

        .c-dialog {
          display: flex; flex-direction: column;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05);
          overflow: hidden;
          width: 100%;
          max-height: calc(100vh - 40px); /* 给上下留点空隙 */
        }

        /* Sizes */
        .size-small  { width: 400px; }
        .size-medium { width: 550px; }
        .size-large  { width: 800px; }
        .size-xlarge { width: 1200px; max-width: 95vw; }
        .size-full   { width: 98vw; height: 95vh; }

        /* Header */
        .c-dialog__header {
          flex-shrink: 0; /* 防止被压缩 */
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 24px;
          border-bottom: 1px solid var(--borderLight);
          background: var(--background);
          z-index: 10;
        }
        .c-dialog__title {
          font-size: 16px; font-weight: 600; color: var(--text);
          display: flex; align-items: center; gap: 8px;
        }
        .c-dialog__close {
          width: 32px; height: 32px;
          border-radius: 6px; border: none; background: transparent;
          color: var(--textTertiary);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
        }
        .c-dialog__close:hover { background: var(--backgroundHover); color: var(--text); }

        /* Body */
        .c-dialog__body {
          flex: 1; /* 占据剩余高度 */
          overflow-y: auto; /* 只有 body 滚动 */
          padding: 24px;
          position: relative;
        }
        .c-dialog__body.no-padding { padding: 0; }

        /* Mobile Adjustments */
        @media (max-width: 640px) {
          .c-dialog {
            width: 100% !important; height: 100%; border-radius: 0;
            border: none; max-height: none;
          }
          .c-dialog__header { padding: 12px 16px; min-height: 56px; }
          .c-dialog__body { padding: 16px; }
        }
      `}</style>
    </BaseModal>
  );
};
