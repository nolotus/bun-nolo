// create/space/components/DeleteContentButton.tsx
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

interface DeleteContentButtonProps {
  contentKey: string;
  title: string;
  theme: any;
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

  // 检查是否作为菜单项渲染
  const isMenuItem = className.includes("SidebarItem__menuItem");

  return (
    <>
      <button
        className={buttonClassName}
        onClick={openConfirmModal}
        disabled={isDeleting}
        data-component="delete-content-button"
      >
        {isMenuItem ? (
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <TrashIcon size={16} />
            {t("delete")}
          </span>
        ) : (
          <TrashIcon size={16} />
        )}
      </button>

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
          opacity: 1;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .DeleteContentButton:hover {
          background-color: ${theme.backgroundTertiary};
          color: ${theme.danger || "#e53e3e"};
          opacity: 1;
        }

        .DeleteContentButton:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
        
        /* 特别为菜单项调整样式 */
        .SidebarItem__menuItem.DeleteContentButton {
          justify-content: flex-start;
          padding: 8px 12px;
          font-size: 13px;
          line-height: 1.4;
          width: 100%;
          text-align: left;
        }
      `}</style>
    </>
  );
};

export default DeleteContentButton;
