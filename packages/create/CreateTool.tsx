import React, { useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { formatISO } from "date-fns";
import toast from "react-hot-toast";
import { CheckIcon } from "@primer/octicons-react";

import { useAppSelector, useAppDispatch } from "app/hooks";
import { useTheme } from "app/theme";
import { patch } from "database/dbSlice";
import {
  selectPageData,
  selectIsReadOnly,
  toggleReadOnly,
  selectPageDbSpaceId,
} from "render/page/pageSlice";
import { updateContentTitle } from "create/space/spaceSlice";
import DeleteButton from "chat/web/DeleteButton";
import Button from "render/web/ui/Button";
import ModeToggle from "web/ui/ModeToggle";

export const CreateTool: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const pageState = useAppSelector(selectPageData);
  const isReadOnly = useAppSelector(selectIsReadOnly);
  const dbSpaceId = useAppSelector(selectPageDbSpaceId);
  const { pageKey: dbKey } = useParams<{ pageKey?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // 更新 URL 查询参数的通用函数
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

  // 切换编辑/只读模式
  const handleToggleEdit = useCallback(
    (isEdit: boolean) => {
      dispatch(toggleReadOnly());
      updateUrl((p) => (isEdit ? p.set("edit", "true") : p.delete("edit")));
    },
    [dispatch, updateUrl]
  );

  // 点击保存
  const handleSave = useCallback(async () => {
    if (!dbKey) {
      toast.error("无法获取页面标识符");
      return;
    }
    const nowISO = formatISO(new Date());
    const title =
      pageState.slateData?.find((n) => n.type === "heading-one")?.children?.[0]
        ?.text || "未命名页面";

    try {
      // 更新页面数据
      await dispatch(
        patch({
          dbKey,
          changes: {
            updatedAt: nowISO,
            slateData: pageState.slateData,
            title,
          },
        })
      ).unwrap();

      // 更新空间内的标题（可选）
      if (dbSpaceId) {
        dispatch(
          updateContentTitle({
            spaceId: dbSpaceId,
            contentKey: dbKey,
            title,
          })
        )
          .unwrap()
          .catch(console.error);
      }

      // 切回只读模式并移除 URL 中的 edit 参数
      dispatch(toggleReadOnly());
      updateUrl((p) => p.delete("edit"));

      toast.success("保存成功");
    } catch (e) {
      console.error("保存失败:", e);
      toast.error("保存失败");
    }
  }, [dispatch, dbKey, pageState.slateData, dbSpaceId, updateUrl]);

  if (!dbKey) {
    return (
      <div style={{ padding: "12px 24px", color: theme.textSecondary }}>
        加载工具栏中...
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
          WebkitBackdropFilter: "blur(8px)",
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
          style={{ display: "flex", alignItems: "center", gap: 24 }}
        >
          <DeleteButton dbKey={dbKey} />
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

      <style>{`
        @media (max-width: 640px) {
          .tools-container { padding: 8px 16px; }
          .title { display: none; }
          .controls { justify-content: space-between; gap: 16px; }
        }
      `}</style>
    </>
  );
};
