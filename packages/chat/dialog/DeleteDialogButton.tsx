import React from "react";
import { TrashIcon } from "@primer/octicons-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Alert, useDeleteAlert } from "render/ui/Alert";
import { deleteCurrentDialog } from "./dialogSlice";

const DeleteDialogButton = ({ dialogConfig }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const onDeleteDialog = async () => {
    await dispatch(deleteCurrentDialog(dialogConfig.id));
    navigate(-1);
  };

  const {
    visible: deleteAlertVisible,
    openAlert,
    doDelete,
    closeAlert,
  } = useDeleteAlert(onDeleteDialog);

  const openDeleteDialog = () => {
    openAlert(dialogConfig);
  };

  const styles = {
    iconButton: {
      background: "transparent",
      border: "none",
      cursor: "pointer",
      padding: "4px",
      color: "inherit",
      borderRadius: "4px",
      flexShrink: 0,
    },
  };

  const IconButton = ({ onClick, children }) => {
    const [isHovered, setIsHovered] = React.useState(false);

    const buttonStyle = {
      ...styles.iconButton,
      backgroundColor: isHovered ? "#f0f0f0" : "transparent",
    };

    return (
      <button
        onClick={onClick}
        style={buttonStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </button>
    );
  };

  return (
    <>
      <IconButton onClick={openDeleteDialog}>
        <TrashIcon size={16} />
      </IconButton>
      <Alert
        isOpen={deleteAlertVisible}
        onClose={closeAlert}
        onConfirm={doDelete}
        title={t("deleteDialogTitle", { title: dialogConfig.title })}
        message={t("deleteDialogConfirmation")}
      />
    </>
  );
};

export default DeleteDialogButton;
