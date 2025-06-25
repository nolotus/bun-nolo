import React, { useCallback, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { TrashIcon } from "@primer/octicons-react";

import { useAppSelector, useAppDispatch } from "app/hooks";
import { useTheme } from "app/theme";

import {
  selectPageData,
  selectIsReadOnly,
  selectPageDbSpaceId,
  toggleReadOnly,
  savePage,
  selectIsSaving,
  // 1. 新增导入 selectHasPendingChanges
  selectHasPendingChanges,
} from "render/page/pageSlice";
import { deleteContentFromSpace } from "create/space/spaceSlice";

import ModeToggle from "web/ui/ModeToggle";
import { ConfirmModal } from "render/web/ui/ConfirmModal";
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
  // 1. 新增获取 hasPendingChanges 状态
  const hasPendingChanges = useAppSelector(selectHasPendingChanges);

  // 路由参数
  const { pageKey: dbKey } = useParams<{ pageKey?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // 删除对话框状态
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 帮助：更新 URL edit 参数
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

  // 切换编辑 / 只读
  const handleToggleEdit = useCallback(
    (isEdit: boolean) => {
      dispatch(toggleReadOnly());
      updateUrl((p) => (isEdit ? p.set("edit", "true") : p.delete("edit")));
    },
    [dispatch, updateUrl]
  );

  // 2. 简化手动保存函数
  const handleSave = useCallback(async () => {
    // dispatch savePage 并处理本次点击的直接反馈 (toast)
    // 不再包含切换模式等副作用
    try {
      await dispatch(savePage()).unwrap();
      toast.success(t("保存成功"));
    } catch (err: any) {
      // unwrap 会在 thunk rejected 时抛出错误，包括 condition 为 false 的情况
      // 如果 err.message 为 'Aborted'，说明是 condition 中止的，可以不弹 toast
      if (err.message !== "Aborted") {
        console.error("保存失败:", err);
        toast.error(t("保存失败"));
      }
    }
  }, [dispatch, t]);

  // 删除页面 —— 使用页面自身的 dbSpaceId，而非当前选中空间
  const handleDelete = async () => {
    if (!dbKey || !dbSpaceId) return;
    setIsDeleting(true);
    try {
      await dispatch(
        deleteContentFromSpace({ contentKey: dbKey, spaceId: dbSpaceId })
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
            onClick={handleSave}
            size="medium"
            // 3. 修正 disabled 条件，增加对 hasPendingChanges 的判断
            disabled={isReadOnly || isSaving || !hasPendingChanges}
            style={{
              opacity: isReadOnly || isSaving || !hasPendingChanges ? 0.6 : 1,
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
