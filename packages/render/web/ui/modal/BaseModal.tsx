// render/web/ui/BaseModal.tsx
import React, { useEffect, useState, useCallback } from "react";
import ReactDOM from "react-dom";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  // 新增 "center" 变体，用于图片预览或强制居中的对话框
  variant?: "default" | "fullscreen" | "slideUp" | "center";
  preventBodyScroll?: boolean;
  closeOnBackdrop?: boolean;
  zIndex?: number;
}

export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  children,
  className = "",
  variant = "default",
  preventBodyScroll = true,
  closeOnBackdrop = true,
  zIndex = 1000,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen && preventBodyScroll) {
      // 简化逻辑，只要打开且允许防抖动就执行
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen, preventBodyScroll]);

  const handleEsc = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") handleClose();
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [isOpen, handleEsc]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    // slideUp 动画稍长一点，其他变体保持轻快
    const duration =
      variant === "slideUp" || (isMobile && variant === "default") ? 200 : 150;

    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, duration);
  }, [onClose, variant, isMobile]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnBackdrop && e.target === e.currentTarget) {
        handleClose();
      }
    },
    [closeOnBackdrop, handleClose]
  );

  const handleContentClick = useCallback((e: React.MouseEvent) => {
    // 注意：对于图片预览，可能允许点击内容关闭，这里保持默认阻止冒泡
    // 如果需要点击图片关闭，可以在外部组件处理
    e.stopPropagation();
  }, []);

  if (!isOpen) return null;

  // 核心逻辑修改：只有 default 会在移动端转 slideUp，center 保持不变
  const actualVariant = isMobile && variant === "default" ? "slideUp" : variant;

  return ReactDOM.createPortal(
    <div
      className={`modal-backdrop ${actualVariant} ${isClosing ? "closing" : ""}`}
      onClick={handleBackdropClick}
      style={{ zIndex }}
    >
      <div
        className={`modal-content ${actualVariant} ${className} ${isClosing ? "closing" : ""}`}
        onClick={handleContentClick}
      >
        {children}
      </div>

      <style href="base-modal" precedence="medium">{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4); /*稍微加深一点背景，提升沉浸感*/
          -webkit-backdrop-filter: blur(4px);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 150ms cubic-bezier(0.4, 0, 0.2, 1);
          /* 修复 Safari 移动端地址栏遮挡问题 */
          height: 100vh; 
          height: 100dvh; 
        }

        .modal-backdrop:not(.closing) {
          opacity: 1;
        }
        
        .modal-backdrop.closing {
          opacity: 0;
          pointer-events: none;
        }

        /* === Default (PC居中, Mobile底部) === */
        .modal-content.default {
          opacity: 0;
          transform: scale(0.95);
          transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .modal-content.default:not(.closing) {
          opacity: 1;
          transform: scale(1);
        }

        /* === Center (强制居中，适用于图片预览/Alert) === */
        .modal-backdrop.center {
          align-items: center;
          justify-content: center;
        }
        .modal-content.center {
          opacity: 0;
          transform: scale(0.92); /* 初始更小一点，弹出的感觉更明显 */
          transition: all 200ms cubic-bezier(0.34, 1.56, 0.64, 1); /* 更有弹性的贝塞尔曲线 */
          display: flex;
          align-items: center;
          justify-content: center;
          max-width: 100vw;
          max-height: 100dvh;
        }
        .modal-content.center:not(.closing) {
          opacity: 1;
          transform: scale(1);
        }

        /* === Fullscreen === */
        .modal-backdrop.fullscreen {
          align-items: stretch;
          justify-content: stretch;
          background: #fff; /* 全屏通常需要实底 */
        }
        .modal-content.fullscreen {
          width: 100%;
          height: 100%;
          opacity: 0;
          transform: translateY(10px);
          transition: all 200ms;
        }
        .modal-content.fullscreen:not(.closing) {
          opacity: 1;
          transform: translateY(0);
        }

        /* === SlideUp (底部抽屉) === */
        .modal-backdrop.slideUp {
          align-items: flex-end;
          justify-content: center; /* 保持水平居中，避免宽屏下太宽 */
        }
        .modal-content.slideUp {
          width: 100%;
          max-width: 640px; /* 限制最大宽度，防止平板上太丑 */
          opacity: 1;
          transform: translateY(100%);
          transition: transform 250ms cubic-bezier(0.32, 0.72, 0, 1);
          border-radius: 16px 16px 0 0; /* 顶部圆角 */
          overflow: hidden;
        }
        .modal-content.slideUp:not(.closing) {
          transform: translateY(0);
        }

        /* === 移动端特定覆盖 === */
        @media (max-width: 640px) {
          /* 这里只处理 default 变自动 slideUp 的情况，center 不受影响 */
          .modal-backdrop.default {
            align-items: flex-end;
          }
          .modal-content.default {
            width: 100%;
            border-radius: 16px 16px 0 0;
            transform: translateY(100%);
            transition: transform 250ms cubic-bezier(0.32, 0.72, 0, 1);
          }
          .modal-content.default:not(.closing) {
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .modal-backdrop, .modal-content { transition: none !important; animation: none !important; }
        }
      `}</style>
    </div>,
    document.body
  );
};
