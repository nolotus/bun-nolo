import React, { useCallback, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { formatISO } from "date-fns";
import toast from "react-hot-toast";
import { CheckIcon, TrashIcon } from "@primer/octicons-react";
import { useTranslation } from "react-i18next";
import { useAppSelector, useAppDispatch } from "app/hooks";
import { useTheme } from "app/theme";
import { patch } from "database/dbSlice";
import {
  selectPageData,
  selectIsReadOnly,
  toggleReadOnly,
  selectPageDbSpaceId,
} from "render/page/pageSlice";
import {
  updateContentTitle,
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
  const pageState = useAppSelector(selectPageData);
  const isReadOnly = useAppSelector(selectIsReadOnly);
  const dbSpaceId = useAppSelector(selectPageDbSpaceId);
  const spaceId = useAppSelector(selectCurrentSpaceId);
  const { pageKey: dbKey } = useParams<{ pageKey?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const updateUrl = useCallback(
    (fn) => {
      const p = new URLSearchParams(searchParams);
      fn(p);
      setSearchParams(p, { replace: true, preventScrollReset: true });
    },
    [searchParams, setSearchParams]
  );

  const handleToggleEdit = useCallback(
    (isEdit) => {
      dispatch(toggleReadOnly());
      updateUrl((p) => (isEdit ? p.set("edit", "true") : p.delete("edit")));
    },
    [dispatch, updateUrl]
  );

  const handleSave = useCallback(async () => {
    if (!dbKey) return toast.error("无法获取页面标识符");
    const title =
      pageState.slateData?.find((n) => n.type === "heading-one")?.children?.[0]
        ?.text || "未命名页面";
    try {
      await dispatch(
        patch({
          dbKey,
          changes: {
            updatedAt: formatISO(new Date()),
            slateData: pageState.slateData,
            title,
          },
        })
      );
      dbSpaceId &&
        dispatch(
          updateContentTitle({ spaceId: dbSpaceId, contentKey: dbKey, title })
        )
          .unwrap()
          .catch(console.error);
      dispatch(toggleReadOnly());
      updateUrl((p) => p.delete("edit"));
      toast.success("保存成功");
    } catch (e) {
      console.error("保存失败:", e);
      toast.error("保存失败");
    }
  }, [dispatch, dbKey, pageState.slateData, dbSpaceId, updateUrl]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteContentFromSpace({ contentKey: dbKey, spaceId }));
      toast.success("Page deleted successfully!");
      navigate(-1);
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Failed to delete page");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (!dbKey)
    return (
      <div style={{ padding: "12px 24px", color: theme.textSecondary }}>
        加载工具栏中...
      </div>
    );

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
          {pageState.title || "加载中..."}
        </div>
        <div
          className="controls"
          style={{ display: "flex", alignItems: "center", gap: 12 }}
        >
          <button
            className="icon-button delete-btn"
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={isDeleting}
            title={t("delete")}
          >
            <TrashIcon size={16} />
          </button>
          <ModeToggle isEdit={!isReadOnly} onChange={handleToggleEdit} />
          <Button
            variant="primary"
            icon={<CheckIcon size={16} />}
            onClick={handleSave}
            size="medium"
            disabled={isReadOnly}
            style={{
              opacity: isReadOnly ? 0 : 1,
              transition: "all 0.2s ease",
            }}
          >
            保存
          </Button>
        </div>
      </div>
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t("deleteDialogTitle", { title: pageState.title || dbKey })}
        message={t("deleteDialogConfirmation")}
        confirmText={t("delete")}
        cancelText={t("cancel")}
        type="error"
        loading={isDeleting}
      />
      <style>{`
        @media (max-width:640px){.tools-container{padding:8px 16px}.title{display:none}.controls{justify-content:space-between;gap:8px}}
        .icon-button{background:transparent;border:none;cursor:pointer;padding:4px;color:inherit;border-radius:4px;flex-shrink:0;position:relative}
        .icon-button:hover:not(:disabled){background-color:#f0f0f0}
        .icon-button:disabled{cursor:not-allowed;opacity:0.6}
        .delete-btn:hover:not(:disabled){color:${theme.error};background-color:rgba(220,38,38,0.1)}
        .save-btn{background-color:rgba(59,130,246,0.1);border:1px solid ${theme.primary};color:${theme.primary};padding:6px 12px;display:flex;align-items:center;justify-content:center;transition:background-color 0.2s, transform 0.1s;}
        .save-btn:hover:not(:disabled){background-color:rgba(59,130,246,0.2);transform:scale(1.05);}
        .save-btn:disabled{background-color:rgba(59,130,246,0.05);border-color:${theme.primary};opacity:0.6;cursor:not-allowed;}
      `}</style>
    </>
  );
};
