// File: PageMenu.jsx (Complete Code)

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { LuTrash2 } from "react-icons/lu";
import { useAppDispatch, useAppSelector } from "app/store";
import {
  selectPageData,
  selectIsReadOnly,
  selectPageDbSpaceId,
  toggleReadOnly,
  savePage,
  selectIsSaving,
  selectHasPendingChanges,
} from "render/page/pageSlice";
import {
  deleteContentFromSpace,
  selectCurrentSpaceId,
} from "create/space/spaceSlice";
import Button from "render/web/ui/Button";
import ModeToggle from "render/web/ui/ModeToggle";
import { ConfirmModal } from "render/web/ui/modal/ConfirmModal";

const PageMenu = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const { pageKey } = useParams();

  // 从 Redux store 中选择所需的状态
  const readOnly = useAppSelector(selectIsReadOnly);
  const saving = useAppSelector(selectIsSaving);
  const pending = useAppSelector(selectHasPendingChanges);
  const page = useAppSelector(selectPageData);
  const dbSpace = useAppSelector(selectPageDbSpaceId);
  const curSpace = useAppSelector(selectCurrentSpaceId);

  // 组件内部状态，用于控制删除确认模态框和删除操作的加载状态
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setDeleting] = useState(false);

  const handleToggleEdit = () => dispatch(toggleReadOnly());

  const handleSave = async () => {
    try {
      await dispatch(savePage()).unwrap();
      toast.success(t("saveSuccess"));
    } catch (e) {
      if (e instanceof Error && e.message !== "Aborted") {
        toast.error(t("saveFailed"));
      }
    }
  };

  const handleDelete = async () => {
    const spaceId = dbSpace || curSpace;
    if (!pageKey || !spaceId) {
      toast.error(t("deleteFailedInfoMissing"));
      return;
    }

    setDeleting(true);
    try {
      await dispatch(
        deleteContentFromSpace({ contentKey: pageKey, spaceId })
      ).unwrap();
      toast.success(t("deleteSuccess"));
      nav(-1, { replace: true }); // 删除成功后返回上一页
    } catch {
      toast.error(t("deleteFailed"));
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  return (
    <>
      {/* 桌面端操作按钮 */}
      <div className="topbar__actions">
        <ModeToggle isEdit={!readOnly} onChange={handleToggleEdit} />
        <button
          className="topbar__button topbar__button--delete"
          onClick={() => setDeleteModalOpen(true)}
          disabled={isDeleting}
          title={t("delete")}
        >
          <LuTrash2 size={16} />
        </button>
        <Button
          variant="primary"
          onClick={handleSave}
          size="small"
          disabled={readOnly || saving || !pending}
          loading={saving}
        >
          {saving ? t("saving") : t("save")}
        </Button>
      </div>

      {/* 移动端操作按钮 */}
      <div className="topbar__mobile-menu">
        <ModeToggle isEdit={!readOnly} onChange={handleToggleEdit} />
        <button
          className="topbar__button topbar__button--delete"
          onClick={() => setDeleteModalOpen(true)}
          disabled={isDeleting}
          title={t("delete")}
        >
          <LuTrash2 size={16} />
        </button>
      </div>

      {/* 删除确认模态框 */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t("deleteDialogTitle", {
          title: page.title || pageKey,
        })}
        message={t("deleteDialogConfirmation")}
        confirmText={t("delete")}
        cancelText={t("cancel")}
        type="error"
        loading={isDeleting}
      />
    </>
  );
};

export default PageMenu;
