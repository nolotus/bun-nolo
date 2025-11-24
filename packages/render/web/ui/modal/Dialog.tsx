// render/web/ui/Dialog.tsx
import { XIcon } from "@primer/octicons-react";
import React, { useEffect, useState } from "react";
import { BaseModal } from "./BaseModal";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  fullScreenOnMobile?: boolean; // 控制移动端是全屏还是底部抽屉
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

  // 决定传给 BaseModal 的变体
  // PC: default (居中)
  // Mobile: 如果 fullScreenOnMobile 为真则 fullscreen，否则 slideUp (底部抽屉)
  const modalVariant = isMobile
    ? fullScreenOnMobile
      ? "fullscreen"
      : "slideUp"
    : "default";

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      variant={modalVariant} // 动态变体
      preventBodyScroll={true}
      className={`dialog-root ${className}`} // 根类名
    >
      <div className={`dialog-container size-${size}`}>
        {/* Header */}
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

        {/* Content */}
        <div className="dialog-content">{children}</div>
      </div>

      <style href="dialog" precedence="medium">{`
        /* 
         * 1. 容器重置 & 布局 
         * BaseModal 已经负责了定位（居中/底部/全屏），
         * 这里主要负责 Dialog 内部的尺寸和视觉风格。
         */
        :global(.dialog-root) {
           /* 确保 BaseModal 的内容容器背景透明，由 dialog-container 接管背景 */
           background: transparent !important;
           box-shadow: none !important;
           padding: 0 !important;
           border: none !important;
           /* 适配 BaseModal 的布局 */
           display: flex;
           justify-content: center; 
        }

        /* 
         * 2. Dialog 主体容器
         */
        .dialog-container {
          display: flex;
          flex-direction: column;
          background-color: var(--background);
          width: 100%;
          
          /* 默认圆角与边框 (PC端) */
          border-radius: var(--space-4);
          border: 1px solid var(--border);
          box-shadow: var(--shadowHeavy);
          
          /* 限制高度，内容过多可滚动 */
          max-height: 85vh;
          overflow: hidden;
          
          /* 确保在 flex 容器中不被过度压缩 */
          flex-shrink: 0; 
        }

        /* 
         * 3. 尺寸控制 (PC)
         */
        .size-small { width: 400px; }
        .size-medium { width: 600px; }
        .size-large { width: 850px; }
        .size-xlarge { width: 1100px; }

        /* 
         * 4. Header 区域
         */
        .dialog-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4) var(--space-6);
          min-height: 64px;
          background-color: var(--background); /* 确保 header 不透明 */
          z-index: 10;
        }

        .dialog-header.with-divider {
          border-bottom: 1px solid var(--border);
        }

        .dialog-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1; /* 占据剩余空间 */
          margin-right: var(--space-4);
        }

        .dialog-close {
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

        .dialog-close:hover {
          background-color: var(--backgroundHover);
          color: var(--text);
        }
        
        .dialog-close:active {
           background-color: var(--backgroundSelected);
        }

        /* 
         * 5. Content 区域
         */
        .dialog-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: var(--space-5) var(--space-6);
          color: var(--textSecondary);
          
          /* 滚动条美化 (Chrome/Safari) */
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }
        
        .dialog-content::-webkit-scrollbar {
          width: 6px;
        }
        .dialog-content::-webkit-scrollbar-thumb {
          background-color: var(--border);
          border-radius: 3px;
        }
        .dialog-content::-webkit-scrollbar-track {
          background: transparent;
        }

        /* 
         * 6. 移动端/全屏适配
         * 当 BaseModal 处于 fullscreen 或 slideUp 模式时，Dialog 需铺满
         */
        :global(.dialog-root.fullscreen) .dialog-container,
        :global(.dialog-root.slideUp) .dialog-container {
          width: 100vw !important;
          max-width: none !important;
          height: 100% !important;
          max-height: none !important;
          border-radius: 0;
          border: none;
          box-shadow: none;
        }

        :global(.dialog-root.slideUp) .dialog-container {
           /* 如果是底部抽屉模式，顶部保留圆角 */
           border-radius: var(--space-4) var(--space-4) 0 0;
           height: auto !important;
           max-height: 90vh !important;
        }
        
        @media (max-width: 640px) {
          .size-small, .size-medium, .size-large, .size-xlarge {
             width: 100%; /* 兜底 */
          }

          .dialog-header {
            padding: var(--space-3) var(--space-4);
            min-height: 56px;
          }
          
          .dialog-content {
             padding: var(--space-4);
          }
          
          .dialog-title {
             font-size: 16px;
          }
        }
        
        @media print {
          .dialog-root { display: none; }
        }
      `}</style>
    </BaseModal>
  );
};

export default Dialog;
