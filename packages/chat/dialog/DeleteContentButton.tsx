//  chat/DeleteContentButton.tsx
import React, { useState } from "react";
import { TrashIcon } from "@primer/octicons-react";
import { useTranslation } from "react-i18next";
import {
  deleteContentFromSpace,
  selectCurrentSpaceId,
} from "create/space/spaceSlice";
import { remove } from "database/dbSlice";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { ConfirmModal } from "web/ui/ConfirmModal";
import toast from "react-hot-toast";
import { Tooltip } from "web/ui/Tooltip";

interface DeleteContentButtonProps {
  contentKey: string;
  title: string;
  theme: any;
}

const DeleteContentButton: React.FC<DeleteContentButtonProps> = ({
  contentKey,
  title,
  theme,
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
      console.log("delete content", contentKey);
      await dispatch(remove(contentKey)).unwrap();

      await dispatch(
        deleteContentFromSpace({
          contentKey,
          spaceId: currentSpaceId,
        })
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

  return (
    <>
      <Tooltip content={t("delete")} placement="top">
        <button
          className="delete-button"
          onClick={openConfirmModal}
          disabled={isDeleting}
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
        .delete-button {
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: ${theme.textTertiary};
          border-radius: 4px;
          padding: 4px;
          cursor: pointer;
          opacity: 0;
          transition: all 0.2s ease;
        }

        .delete-button:hover {
          background-color: ${theme.backgroundTertiary};
          color: ${theme.danger || "#e53e3e"};
          opacity: 1 !important;
        }

        .delete-button:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
      `}</style>
    </>
  );
};

export default DeleteContentButton;
