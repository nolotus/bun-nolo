import React from "react";
import { TrashIcon } from "@primer/octicons-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  deleteDialog,
  resetCurrentDialogTokens,
} from "chat/dialog/dialogSlice";
import { Alert, useDeleteAlert } from "render/ui/Alert";
import { useParams } from "react-router-dom";
import { clearMessages } from "../messages/messageSlice";

const DeleteDialogButton = ({ dialogConfig }) => {
  const { dialogId } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const onDeleteDialog = () => {
    dispatch(deleteDialog(dialogId));
    dispatch(clearMessages());
    dispatch(resetCurrentDialogTokens());
    navigate(-1);
  };

  const {
    visible: deleteAlertVisible,
    confirmDelete,
    doDelete,
    closeAlert,
  } = useDeleteAlert(onDeleteDialog);

  const onDeleteClick = () => {
    confirmDelete(dialogConfig);
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
      <IconButton onClick={onDeleteClick}>
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
