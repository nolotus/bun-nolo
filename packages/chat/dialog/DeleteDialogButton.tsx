import React, { useState } from "react";
import { TrashIcon } from "@primer/octicons-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ConfirmModal } from "render/web/ui/ConfirmModal";
import { deleteCurrentDialog } from "./dialogSlice";
import toast from "react-hot-toast";
import { Tooltip } from "render/web/ui/Tooltip";

const DeleteDialogButton = ({ dialogConfig }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
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
        `}
      </style>

      <Tooltip content={t("delete")} placement="bottom">
        <button
          className="icon-button"
          onClick={() => setIsOpen(true)}
          disabled={isDeleting}
        >
          <TrashIcon size={16} />
        </button>
      </Tooltip>

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
