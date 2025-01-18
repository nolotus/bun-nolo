// render/ui/ConfirmModal.tsx
import React from "react";
import { BaseModal } from "./BaseModal";
import Button from "web/ui/Button";
import { useTheme } from "app/theme";

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
  const theme = useTheme();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} className="confirm-modal">
      <div className="confirm-content">
        <h3 className="title">{title}</h3>
        <p className="message">{message}</p>

        <div className="actions">
          <Button onClick={onClose} variant="secondary" size="small">
            {cancelText}
          </Button>
          <Button onClick={handleConfirm} status={status} size="small">
            {confirmText}
          </Button>
        </div>
      </div>

      <style>{`
        .confirm-modal {
          background: ${theme.background};
          border-radius: 8px;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
          width: 100%;
          max-width: 400px;
          margin: 16px;
        }
        
        .confirm-content {
          padding: 24px;
        }

        .title {
          font-size: 18px;
          font-weight: bold;
          color: ${theme.text};
          margin: 0 0 12px 0;
        }

        .message {
          color: ${theme.textSecondary};
          margin: 0 0 24px 0;
          line-height: 1.5;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
      `}</style>
    </BaseModal>
  );
};
