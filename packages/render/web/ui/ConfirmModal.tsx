// render/web/ui/ConfirmModal.tsx

import React from "react";
import Button from "render/web/ui/Button";
import { BaseActionModal } from "render/web/ui/BaseActionModal";
import {
  LuCircleX,
  LuTriangleAlert,
  LuCircleCheck,
  LuInfo,
} from "react-icons/lu";

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

const ICON_MAP: Record<Required<ConfirmModalProps>["type"], React.ElementType> =
  {
    error: LuCircleX,
    warning: LuTriangleAlert,
    success: LuCircleCheck,
    info: LuInfo,
  };

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
  const IconComponent = ICON_MAP[type] || LuInfo;

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
    <>
      <BaseActionModal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        titleIcon={<IconComponent size={16} />}
        status={type}
        actions={actions}
        width={400}
        onEnterPress={onConfirm}
        isActionDisabled={loading}
      >
        {/* Updated class name for better specificity */}
        <p className="ConfirmModal-message">{message}</p>
      </BaseActionModal>

      <style href="confirm-modal-styles" precedence="component">{`
        .ConfirmModal-message {
          margin: 0;
          line-height: 1.5;
          color: var(--text);
          font-size: 14px;
        }

        /* 
          This style targets the title element rendered within BaseActionModal.
          The specific class name 'ConfirmModal-title' improves clarity and reduces conflict risk.
          This assumes BaseActionModal assigns a 'title' or a similarly targetable class to its title element.
        */
        .BaseActionModal .title, 
        .ConfirmModal-title {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: var(--text);
          font-size: 16px;
          font-weight: 500;
        }
      `}</style>
    </>
  );
};
