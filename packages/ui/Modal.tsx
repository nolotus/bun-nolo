import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useKey } from "react-use";

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

  if (!isOpen) return null;

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleOverlayClick}
    >
      <div
        className={`m-auto shadow-2xl rounded-lg w-1/3 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};
