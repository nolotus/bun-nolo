import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useKey } from "react-use";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";

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
}

export const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  const theme = useSelector(selectTheme);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useKey("Escape", onClose);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const overlayStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: theme.zIndex.layer2,
    backdropFilter: "blur(5px)",
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  };

  const contentStyle = {
    margin: "auto",
    width: "100%",
    transition: "all 0.3s ease",
    boxShadow: theme.shadowStrength
      ? `0 1px 2px 0 rgba(${theme.shadowColor}, ${theme.shadowStrength})`
      : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  };

  const getResponsiveWidth = (screenWidth) => {
    const { breakpoints } = theme;
    if (screenWidth >= breakpoints[5]) return "50%"; // 2xl
    if (screenWidth >= breakpoints[4]) return "50%"; // xl
    if (screenWidth >= breakpoints[3]) return "66.666667%"; // lg
    if (screenWidth >= breakpoints[2]) return "75%"; // md
    if (screenWidth >= breakpoints[1]) return "83.333333%"; // sm
    return "91.666667%"; // xs
  };

  return createPortal(
    <div style={overlayStyle} onClick={handleOverlayClick}>
      <div
        style={{
          ...contentStyle,
          width: getResponsiveWidth(windowWidth),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};
