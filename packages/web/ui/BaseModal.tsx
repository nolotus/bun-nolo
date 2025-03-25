// web/ui/BaseModal.tsx
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  children,
  className = "",
}) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 150);
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className={`modal-backdrop ${isClosing ? "closing" : ""}`}
      onClick={handleClose}
    >
      <div
        className={`modal-content ${className} ${isClosing ? "closing" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>

      <style href="base-modal">{`
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
          z-index: 1000;
          opacity: 0;
          transition-property: opacity, backdrop-filter;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }

        .modal-backdrop:not(.closing) {
          opacity: 1;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          opacity: 0;
          transform: scale(0.95);
          transition-property: opacity, transform;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
        }

        .modal-content:not(.closing) {
          opacity: 1;
          transform: scale(1);
        }

        @media (prefers-reduced-motion: reduce) {
          .modal-backdrop,
          .modal-content {
            transition: none;
          }
        }
      `}</style>
    </div>,
    document.body
  );
};
