import React, { useState } from "react";
import { TrashIcon } from "@primer/octicons-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Alert, useDeleteAlert } from "web/ui/Alert";
import { deleteCurrentDialog } from "./dialogSlice";

const DeleteDialogButton = ({ dialogConfig }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showTooltip, setShowTooltip] = useState(false);

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
            position: relative; /* 创建定位上下文 */
          }
          .icon-button:hover {
            background-color: #f0f0f0;
          }

          .tooltip {
            position: absolute;
            bottom: -25px; /* 调整垂直距离 */
            right: -10px;
            background-color:#f0f0f0;
            color:black;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            z-index: 1; /* 确保提示显示在按钮上方 */
          }
        `}
      </style>
      <button
        className="icon-button"
        onClick={openDeleteDialog}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <TrashIcon size={16} />
        {showTooltip && (
          <div className="tooltip">{t("delete")}</div>
        )}
      </button>
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
