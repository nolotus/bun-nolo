import React from "react";
import Button from "render/web/ui/Button";
import { BaseActionModal } from "./BaseActionModal";
import {
  XCircleIcon,
  AlertIcon,
  CheckCircleIcon,
  InfoIcon,
} from "@primer/octicons-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "info" | "warning" | "error" | "success";
  loading?: boolean;
  showCancel?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "确认",
  cancelText = "取消",
  type = "warning",
  loading = false,
  showCancel = true,
}) => {
  const getStatusIcon = () => {
    const size = 16;
    switch (type) {
      case "error":
        return <XCircleIcon size={size} />;
      case "warning":
        return <AlertIcon size={size} />;
      case "success":
        return <CheckCircleIcon size={size} />;
      case "info":
      default:
        return <InfoIcon size={size} />;
    }
  };

  const actions = (
    <>
      {showCancel && (
        <Button
          onClick={onClose}
          variant="secondary"
          size="small"
          disabled={loading}
        >
          {cancelText}
        </Button>
      )}
      <Button
        onClick={onConfirm}
        status={type === "error" ? "error" : undefined}
        size="small"
        loading={loading}
        disabled={loading}
      >
        {confirmText}
      </Button>
    </>
  );

  return (
    <BaseActionModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      titleIcon={getStatusIcon()}
      status={type}
      actions={actions}
      width={400}
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
