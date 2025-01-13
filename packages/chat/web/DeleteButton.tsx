import { TrashIcon } from "@primer/octicons-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Alert, useDeleteAlert } from "web/ui/Alert";
import { deleteData } from "database/dbSlice";
import toast from "react-hot-toast";

const DeleteButton = ({ id }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const onDeleteDialog = async () => {
    await dispatch(deleteData(id));
    toast.success("Page deleted successfully!");
    navigate(-1);
  };

  const {
    visible: deleteAlertVisible,
    openAlert,
    doDelete,
    closeAlert,
  } = useDeleteAlert(onDeleteDialog);

  const openDeleteDialog = () => {
    openAlert(id);
  };

  return (
    <>
      <style>
        {`
          .icon-button {
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 4px;
            color: inherit;
            border-radius: 4px;
            flex-shrink: 0;
          }
          .icon-button:hover {
            background-color: #f0f0f0;
          }
        `}
      </style>
      <button className="icon-button" onClick={openDeleteDialog}>
        <TrashIcon size={16} />
      </button>
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
