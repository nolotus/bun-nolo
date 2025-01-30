import { TrashIcon } from "@primer/octicons-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Alert, useDeleteAlert } from "web/ui/Alert";
import { remove } from "database/dbSlice";
import toast from "react-hot-toast";
import { IconHoverButton } from "render/ui/IconHoverButton";

interface DeleteButtonProps {
  id: string;
}

const DeleteButton = ({ id }: DeleteButtonProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // 处理删除确认后的操作
  const onDelete = async () => {
    try {
      await dispatch(remove(id));
      toast.success("Page deleted successfully!");
      navigate(-1);
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Failed to delete page");
    }
  };

  const {
    visible: deleteAlertVisible,
    openAlert,
    doDelete,
    closeAlert,
  } = useDeleteAlert(onDelete);

  return (
    <>
      <IconHoverButton
        variant="danger"
        size="small"
        icon={<TrashIcon size={16} />}
        onClick={() => openAlert(id)}
        aria-label="Delete item"
      >
        {t("delete")}
      </IconHoverButton>

      <Alert
        isOpen={deleteAlertVisible}
        onClose={closeAlert}
        onConfirm={doDelete}
        title={t("deleteDialogTitle", { title: id })}
        message={t("deleteDialogConfirmation")}
      />
    </>
  );
};

export default DeleteButton;
