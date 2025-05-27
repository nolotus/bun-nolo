// render/web/ui/BaseModal.tsx
import React, { useEffect, useState, useCallback } from "react";
import ReactDOM from "react-dom";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "fullscreen" | "slideUp"; // 新增变体支持
  preventBodyScroll?: boolean; // 新增防止滚动穿透
  closeOnBackdrop?: boolean; // 新增控制背景点击关闭
  zIndex?: number; // 新增自定义层级
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

  // 检测移动设备
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 处理滚动穿透
  useEffect(() => {
    if (isOpen && preventBodyScroll && (isMobile || variant === "fullscreen")) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;

      // 获取滚动条宽度
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
  }, [isOpen, preventBodyScroll, isMobile, variant]);

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
    const duration = variant === "slideUp" ? 200 : 150;

    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, duration);
  }, [onClose, variant]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnBackdrop && e.target === e.currentTarget) {
        handleClose();
      }
    },
    [closeOnBackdrop, handleClose]
  );

  const handleContentClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  }, []);

  if (!isOpen) return null;

  // 根据变体确定实际的变体类型
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
          background: rgba(0, 0, 0, 0.1);
          -webkit-backdrop-filter: blur(4px);
          backdrop-filter: blur(0);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition-property: opacity, backdrop-filter;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }

        .modal-backdrop:not(.closing) {
          opacity: 1;
          backdrop-filter: blur(4px);
        }

        /* 默认变体 */
        .modal-content.default {
          opacity: 0;
          transform: scale(0.95);
          transition-property: opacity, transform;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }

        .modal-content.default:not(.closing) {
          opacity: 1;
          transform: scale(1);
        }

        /* 全屏变体 */
        .modal-backdrop.fullscreen {
          align-items: stretch;
          justify-content: stretch;
        }

        .modal-content.fullscreen {
          opacity: 0;
          transform: scale(0.98);
          transition-property: opacity, transform;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
          width: 100%;
          height: 100%;
        }

        .modal-content.fullscreen:not(.closing) {
          opacity: 1;
          transform: scale(1);
        }

        /* 上滑变体（移动端） */
        .modal-backdrop.slideUp {
          align-items: flex-end;
          justify-content: stretch;
        }

        .modal-content.slideUp {
          opacity: 0;
          transform: translateY(100%);
          transition-property: opacity, transform;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 200ms;
          width: 100%;
          max-height: 95vh;
        }

        .modal-content.slideUp:not(.closing) {
          opacity: 1;
          transform: translateY(0);
        }

        /* 移动端优化 */
        @media (max-width: 640px) {
          .modal-backdrop.default {
            align-items: flex-end;
            justify-content: stretch;
          }

          .modal-content.default {
            transform: translateY(100%);
            width: 100%;
            max-height: 95vh;
            transition-duration: 200ms;
          }

          .modal-content.default:not(.closing) {
            transform: translateY(0);
          }
        }

        /* 无障碍支持 */
        @media (prefers-reduced-motion: reduce) {
          .modal-backdrop,
          .modal-content {
            transition: none;
          }
        }

        /* 安全区域支持 */
        @supports (padding: env(safe-area-inset-bottom)) {
          .modal-content.slideUp,
          @media (max-width: 640px) {
            .modal-content.default {
              padding-bottom: env(safe-area-inset-bottom);
            }
          }
        }
      `}</style>
    </div>,
    document.body
  );
};
