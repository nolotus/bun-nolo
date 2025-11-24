// create/space/components/DeleteContentButton.tsx

import React, { useState } from "react";
import { TrashIcon } from "@primer/octicons-react";
import { useTranslation } from "react-i18next";
import {
  deleteContentFromSpace,
  selectCurrentSpaceId,
} from "create/space/spaceSlice";
import { useAppDispatch, useAppSelector } from "app/store";
import { ConfirmModal } from "render/web/ui/modal/ConfirmModal";
import toast from "react-hot-toast";

interface DeleteContentButtonProps {
  contentKey: string;
  title: string;
  className?: string;
  /**
   * Render the button as a different component or HTML tag.
   * This is useful for polymorphic components, e.g., rendering as a MenuItem.
   */
  as?: React.ElementType;
}

const DeleteContentButton: React.FC<DeleteContentButtonProps> = ({
  contentKey,
  title,
  className,
  as: Component = "button",
}) => {
  const { t } = useTranslation(["chat"]);
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
    if (!currentSpaceId) {
      toast.error(t("errors.noCurrentSpace"));
      return;
    }
    setIsDeleting(true);
    try {
      await dispatch(
        deleteContentFromSpace({ contentKey, spaceId: currentSpaceId })
      ).unwrap();
      toast.success(t("deleteSuccess"));
      setIsConfirmOpen(false);
    } catch (error) {
      console.error("Failed to delete content:", error);
      toast.error(t("errors.deleteFailed"));
    } finally {
      setIsDeleting(false);
    }
  };

  const props = {
    className: `DeleteButton ${className || ""}`.trim(),
    onClick: openConfirmModal,
    disabled: isDeleting,
    ...(Component !== "button" && {
      icon: TrashIcon,
      label: t("common:delete"),
    }),
  };

  return (
    <>
      <Component {...props}>
        {Component === "button" && <TrashIcon size={16} />}
      </Component>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title={t("deleteContentTitle", { title })}
        message={t("deleteContentConfirmation")}
        confirmText={t("common:delete")}
        cancelText={t("common:cancel")}
        type="error"
        loading={isDeleting}
        showCancel
      />

      <style href="delete-content-button-styles" precedence="component">{`
        .DeleteButton {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: var(--textTertiary);
          border-radius: var(--space-1);
          padding: var(--space-1);
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .DeleteButton:hover:not(:disabled) {
          color: var(--error);
          background-color: var(--backgroundTertiary);
        }

        .DeleteButton:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
        
        /* 
          When rendered as a MenuItem (or any component that receives this class), 
          it will adopt the danger color on hover.
        */
        .DeleteButton.SidebarItemMenuItem:hover:not(:disabled) {
          background-color: color-mix(in srgb, var(--error) 15%, transparent);
          color: var(--error);
        }
      `}</style>
    </>
  );
};

export default DeleteContentButton;
