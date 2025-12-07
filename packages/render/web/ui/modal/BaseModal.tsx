// render/web/ui/BaseModal.tsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import ReactDOM from "react-dom";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
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
  zIndex = 1010,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen && preventBodyScroll) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen, preventBodyScroll]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200); // 配合 CSS transition 时间
  }, [onClose]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    },
    [handleClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", onKeyDown);
      return () => document.removeEventListener("keydown", onKeyDown);
    }
  }, [isOpen, onKeyDown]);

  if (!isOpen) return null;

  // 移动端强制 slideUp 体验更好
  const activeVariant = isMobile && variant === "default" ? "slideUp" : variant;

  return ReactDOM.createPortal(
    <div
      className={`modal-backdrop ${activeVariant} ${isClosing ? "closing" : ""}`}
      onClick={(e) =>
        closeOnBackdrop && e.target === e.currentTarget && handleClose()
      }
      style={{ zIndex }}
    >
      <div
        className={`modal-content ${activeVariant} ${className} ${isClosing ? "closing" : ""}`}
      >
        {children}
      </div>

      <style href="base-modal" precedence="high">{`
        .modal-backdrop {
          position: fixed; inset: 0;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(4px);
          display: flex;
          opacity: 0;
          transition: opacity 0.2s ease-out;
        }
        .modal-backdrop:not(.closing) { opacity: 1; }
        .modal-backdrop.closing { opacity: 0; pointer-events: none; }

        /* --- Center Variant (PC 默认/预览图) --- */
        .modal-backdrop.center, 
        .modal-backdrop.default {
          align-items: center; justify-content: center;
          padding: 20px; /* 防止贴边 */
        }
        .modal-content.center,
        .modal-content.default {
          opacity: 0; transform: scale(0.95) translateY(10px);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .modal-content:not(.closing) {
          opacity: 1; transform: scale(1) translateY(0);
        }

        /* --- SlideUp (Mobile) --- */
        .modal-backdrop.slideUp { align-items: flex-end; }
        .modal-content.slideUp {
          width: 100%; max-height: 90vh;
          border-radius: 20px 20px 0 0;
          transform: translateY(100%);
          transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
        }
        .modal-content.slideUp:not(.closing) { transform: translateY(0); }

        /* --- Fullscreen --- */
        .modal-content.fullscreen {
          width: 100vw; height: 100dvh;
          border-radius: 0;
        }
      `}</style>
    </div>,
    document.body
  );
};
