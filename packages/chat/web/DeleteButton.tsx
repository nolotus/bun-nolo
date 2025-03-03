import { TrashIcon } from "@primer/octicons-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { remove } from "database/dbSlice";
import toast from "react-hot-toast";
import { IconHoverButton } from "render/ui/IconHoverButton";
import {
  deleteContentFromSpace,
  selectCurrentSpaceId,
} from "create/space/spaceSlice";
import { useAppSelector } from "app/hooks";
import { ConfirmModal } from "web/ui/ConfirmModal";
import { useState } from "react";

interface DeleteButtonProps {
  dbKey: string;
}

const DeleteButton = ({ dbKey }: DeleteButtonProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const spaceId = useAppSelector(selectCurrentSpaceId);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteKey = dbKey;

  // 处理删除确认后的操作
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      dispatch(remove(deleteKey));

      await dispatch(
        deleteContentFromSpace({ contentKey: deleteKey, spaceId })
      );
      toast.success("Page deleted successfully!");
      navigate("/create");
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Failed to delete page");
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <IconHoverButton
        variant="danger"
        size="small"
        icon={<TrashIcon size={16} />}
        onClick={() => setIsOpen(true)}
        aria-label="Delete item"
        disabled={isDeleting}
      >
        {t("delete")}
      </IconHoverButton>

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        title={t("deleteDialogTitle", { title: dbKey })}
        message={t("deleteDialogConfirmation")}
        confirmText={t("delete")}
        cancelText={t("cancel")}
        type="error"
        loading={isDeleting}
      />
    </>
  );
};

export default DeleteButton;
