import React, { useState } from "react";
import { TrashIcon } from "@primer/octicons-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ConfirmModal } from "web/ui/ConfirmModal";
import { deleteCurrentDialog } from "./dialogSlice";
import toast from "react-hot-toast"; // 添加 toast 提示

const DeleteDialogButton = ({ dialogConfig }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const deleteKey = dialogConfig.dbKey || dialogConfig.id;
      await dispatch(deleteCurrentDialog(deleteKey));
      toast.success(t("deleteSuccess")); // 添加成功提示
      navigate(-1);
    } catch (error) {
      console.error("Failed to delete dialog:", error);
      toast.error(t("deleteFailed")); // 添加错误提示
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
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
            position: relative;
          }
          
          .icon-button:hover {
            background-color: #f0f0f0;
          }

          .tooltip {
            position: absolute;
            bottom: -25px;
            right: -10px;
            background-color: #f0f0f0;
            color: black;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            z-index: 1;
          }
        `}
      </style>

      <button
        className="icon-button"
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        disabled={isDeleting}
      >
        <TrashIcon size={16} />
        {showTooltip && <div className="tooltip">{t("delete")}</div>}
      </button>

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        title={t("deleteDialogTitle", { title: dialogConfig.title })}
        message={t("deleteDialogConfirmation")}
        confirmText={t("delete")}
        cancelText={t("cancel")}
        type="error"
        loading={isDeleting}
      />
    </>
  );
};

export default DeleteDialogButton;
