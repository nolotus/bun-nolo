import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useKey } from "react-use";
import { useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive";

import { selectTheme } from "app/theme/themeSlice";
import { stylePresets } from "render/styles/stylePresets";

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

  // 使用 react-responsive 的 hooks 定义响应式断点
  const is2xl = useMediaQuery({ minWidth: theme.breakpoints[5] });
  const isXl = useMediaQuery({ minWidth: theme.breakpoints[4] });
  const isLg = useMediaQuery({ minWidth: theme.breakpoints[3] });
  const isMd = useMediaQuery({ minWidth: theme.breakpoints[2] });
  const isSm = useMediaQuery({ minWidth: theme.breakpoints[1] });

  useKey("Escape", onClose);

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
    ...stylePresets.zIndex3,
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

  // 根据响应式断点获取宽度
  const getResponsiveWidth = () => {
    if (is2xl || isXl) return "50%";
    if (isLg) return "66.666667%";
    if (isMd) return "75%";
    if (isSm) return "83.333333%";
    return "91.666667%";
  };

  return createPortal(
    <div style={overlayStyle} onClick={handleOverlayClick}>
      <div
        style={{
          ...contentStyle,
          width: getResponsiveWidth(),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
};
