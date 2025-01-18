// render/ui/ConfirmModal.tsx
import React from "react";
import Button from "web/ui/Button";
import { BaseActionModal } from "./BaseActionModal";
import { AlertIcon, AlertFillIcon, InfoIcon } from "@primer/octicons-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  status?: "warning" | "error" | "info";
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "确认",
  cancelText = "取消",
  status = "warning",
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getStatusIcon = () => {
    // Primer的图标默认就是16px
    switch (status) {
      case "error":
        return <AlertFillIcon size={16} />; // 错误用实心图标
      case "warning":
        return <AlertIcon size={16} />; // 警告用描边图标
      case "info":
        return <InfoIcon size={16} />;
      default:
        return null;
    }
  };

  return (
    <BaseActionModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      status={status}
      titleIcon={getStatusIcon()}
      width={400}
      actions={
        <>
          <Button onClick={onClose} variant="secondary" size="small">
            {cancelText}
          </Button>
          <Button onClick={handleConfirm} status={status} size="small">
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="confirm-message">{message}</p>

      <style jsx>{`
        .confirm-message {
          margin: 0;
          line-height: 1.5;
        }
      `}</style>
    </BaseActionModal>
  );
};
