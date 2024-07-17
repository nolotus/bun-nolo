import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useKey } from "react-use";
import OpenProps from "open-props";

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
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: OpenProps.layer2,
        backdropFilter: "blur(5px)",
        inset: 0,
        position: "fixed",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
      }}
      onClick={handleOverlayClick}
    >
      <div
        className={`m-auto w-full  
    transition-all sm:w-3/4 md:w-3/5 lg:w-2/3 xl:w-1/2 2xl:w-1/2 ${className}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: OpenProps.shadow5,
        }}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};
