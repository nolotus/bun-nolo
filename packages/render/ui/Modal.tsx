import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useKey } from "react-use";
import Shadows from "open-props/src/shadows";
import ZIndex from "open-props/src/zindex";

export const useModal = () => {
  const [visible, setVisible] = useState(false);
  const [modalState, setModalState] = useState(null);

  const open = (item) => {
    setModalState(item);
    setVisible(true);
  };

  const close = () => {
    setVisible(false);
  };

  return { visible, open, close, modalState };
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Modal = ({ isOpen, onClose, children, className }: ModalProps) => {
  useKey("Escape", onClose);
  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      style={{
        zIndex: ZIndex["--layer-2"],
      }}
      onClick={handleOverlayClick}
    >
      <div
        className={`m-auto w-full  
    transition-all sm:w-3/4 md:w-3/5 lg:w-2/3 xl:w-1/2 2xl:w-1/2 ${className}`}
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: Shadows["--shadow-6"] }}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};
