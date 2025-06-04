// 文件路径：src/features/page/CreateTool.tsx

import React, { useCallback, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { UploadIcon, TrashIcon } from "@primer/octicons-react";

import { useAppSelector, useAppDispatch } from "app/hooks";
import { useTheme } from "app/theme";

import {
  selectPageData,
  selectIsReadOnly,
  selectPageDbSpaceId,
  toggleReadOnly,
  savePage,
  selectIsSaving,
  selectSaveError,
} from "render/page/pageSlice";
import {
  deleteContentFromSpace,
  selectCurrentSpaceId,
} from "create/space/spaceSlice";

import ModeToggle from "web/ui/ModeToggle";
import { ConfirmModal } from "web/ui/ConfirmModal";
import Button from "render/web/ui/Button";

export const CreateTool: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // 页面状态
  const pageState = useAppSelector(selectPageData);
  const isReadOnly = useAppSelector(selectIsReadOnly);
  const dbSpaceId = useAppSelector(selectPageDbSpaceId);
  // 保存状态
  const isSaving = useAppSelector(selectIsSaving);
  const saveError = useAppSelector(selectSaveError);

  // 当前空间、路由参数
  const spaceId = useAppSelector(selectCurrentSpaceId);
  const { pageKey: dbKey } = useParams<{ pageKey?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // 删除对话框状态
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 帮助函数：更新 URL 的 edit 参数
  const updateUrl = useCallback(
    (fn: (p: URLSearchParams) => void) => {
      const p = new URLSearchParams(searchParams);
      fn(p);
      setSearchParams(p, {
        replace: true,
        preventScrollReset: true,
      });
    },
    [searchParams, setSearchParams]
  );

  // 切换「只读 ↔ 编辑」
  const handleToggleEdit = useCallback(
    (isEdit: boolean) => {
      dispatch(toggleReadOnly());
      updateUrl((p) => (isEdit ? p.set("edit", "true") : p.delete("edit")));
    },
    [dispatch, updateUrl]
  );

  // 手动保存
  const handleSave = useCallback(async () => {
    if (!dbKey) {
      toast.error(t("无法获取页面标识符"));
      return;
    }
    try {
      // 调用 savePage thunk（里面会从 store 拿最新的 slateData/title）
      await dispatch(savePage()).unwrap();
      toast.success(t("保存成功"));

      // 切回只读、清除 URL edit 参数
      dispatch(toggleReadOnly());
      updateUrl((p) => p.delete("edit"));
    } catch (err: any) {
      console.error("保存失败:", err);
      toast.error(t("保存失败"));
    }
  }, [dispatch, dbKey, savePage, toggleReadOnly, updateUrl, t]);

  // 删除页面
  const handleDelete = async () => {
    if (!dbKey) return;
    setIsDeleting(true);
    try {
      await dispatch(
        deleteContentFromSpace({ contentKey: dbKey, spaceId })
      ).unwrap();
      toast.success(t("删除成功"));
      navigate(-1);
    } catch (err) {
      console.error("删除失败:", err);
      toast.error(t("删除失败"));
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  // render
  if (!dbKey) {
    return (
      <div
        style={{
          padding: "12px 24px",
          color: theme.textSecondary,
        }}
      >
        {t("加载工具栏中...")}
      </div>
    );
  }

  return (
    <>
      <div
        className="tools-container"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 24px",
          background: theme.background,
          borderBottom: `1px solid ${theme.border}`,
          backdropFilter: "blur(8px)",
        }}
      >
        {/* 标题 */}
        <div
          className="title"
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: theme.textPrimary,
            marginRight: 24,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            minWidth: 50,
            flexShrink: 1,
          }}
        >
          {pageState.title || t("加载中...")}
        </div>

        {/* 操作按钮 */}
        <div
          className="controls"
          style={{ display: "flex", alignItems: "center", gap: 12 }}
        >
          <ModeToggle isEdit={!isReadOnly} onChange={handleToggleEdit} />

          <button
            className="icon-button delete-btn"
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={isDeleting}
            title={t("delete", "删除")}
          >
            <TrashIcon size={16} />
          </button>

          <Button
            variant="primary"
            icon={<UploadIcon size={16} />}
            onClick={handleSave}
            size="medium"
            disabled={isReadOnly || isSaving}
            style={{
              opacity: isReadOnly || isSaving ? 0.6 : 1,
              transition: "all 0.2s ease",
            }}
          >
            {isSaving ? t("saving", "保存中...") : t("save", "保存")}
          </Button>
        </div>
      </div>

      {/* 删除确认弹窗 */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t("deleteDialogTitle", {
          title: pageState.title || dbKey,
        })}
        message={t("deleteDialogConfirmation")}
        confirmText={t("delete", "删除")}
        cancelText={t("cancel", "取消")}
        type="error"
        loading={isDeleting}
      />

      {/* 局部样式 */}
      <style>{`
        @media (max-width:640px){
          .tools-container{padding:8px 16px}
          .title{display:none}
          .controls{justify-content:space-between;gap:8px}
        }
        .icon-button{
          background:transparent;border:none;cursor:pointer;
          padding:4px;color:inherit;border-radius:4px;
          flex-shrink:0;position:relative
        }
        .icon-button:hover:not(:disabled){
          background-color:#f0f0f0
        }
        .icon-button:disabled{
          cursor:not-allowed;opacity:0.6
        }
        .delete-btn:hover:not(:disabled){
          color:${theme.error};
          background-color:rgba(220,38,38,0.1)
        }
      `}</style>
    </>
  );
};
