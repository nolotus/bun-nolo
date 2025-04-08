// chat/DeleteContentButton.tsx
import React, { useState } from "react";
import { TrashIcon } from "@primer/octicons-react";
import { useTranslation } from "react-i18next";
import {
  deleteContentFromSpace,
  selectCurrentSpaceId,
} from "create/space/spaceSlice";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { ConfirmModal } from "web/ui/ConfirmModal";
import toast from "react-hot-toast";
import { Tooltip } from "web/ui/Tooltip";

interface DeleteContentButtonProps {
  contentKey: string;
  title: string;
  theme: any;
  // 添加 className prop 以允许父组件控制样式
  className?: string;
}

const DeleteContentButton: React.FC<DeleteContentButtonProps> = ({
  contentKey,
  title,
  theme,
  className = "",
}) => {
  const { t } = useTranslation("chat");
  const dispatch = useAppDispatch();
  const currentSpaceId = useAppSelector(selectCurrentSpaceId);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const openConfirmModal = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    if (!currentSpaceId) {
      console.error("No current space selected");
      toast.error(t("deleteFailed"));
      setIsDeleting(false);
      return;
    }
    try {
      await dispatch(
        deleteContentFromSpace({ contentKey, spaceId: currentSpaceId })
      );
      toast.success(t("deleteSuccess"));
    } catch (error) {
      console.error("Failed to delete content:", error);
      toast.error(t("deleteFailed"));
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  const buttonClassName = `DeleteContentButton ${className}`.trim();

  return (
    <>
      <Tooltip content={t("delete")} placement="top">
        <button
          className={buttonClassName}
          onClick={openConfirmModal}
          disabled={isDeleting}
          // 添加 data attribute 便于父组件在需要时进行更复杂的 CSS 选择
          data-component="delete-content-button"
        >
          <TrashIcon size={16} />
        </button>
      </Tooltip>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title={t("deleteContentTitle", { title })}
        message={t("deleteContentConfirmation")}
        confirmText={t("delete")}
        cancelText={t("cancel")}
        type="error"
        loading={isDeleting}
      />

      <style href="delete-content-button">{`
        .DeleteContentButton {
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: ${theme.textTertiary};
          border-radius: 4px;
          padding: 4px;
          cursor: pointer;
          /* 已移除 opacity: 0; 由父组件控制可见性 */
          opacity: 1;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .DeleteContentButton:hover {
          background-color: ${theme.backgroundTertiary};
          color: ${theme.danger || "#e53e3e"};
          /* 如果父组件样式不冲突，则无需 !important */
          opacity: 1;
        }

        .DeleteContentButton:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
      `}</style>
    </>
  );
};

export default DeleteContentButton;
