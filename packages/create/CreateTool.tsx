import React, { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { formatISO } from "date-fns";
import { patch } from "database/dbSlice";
import {
  selectPageData,
  selectIsReadOnly,
  toggleReadOnly,
  selectPageDbSpaceId,
} from "render/page/pageSlice"; // 确认路径
import { updateContentTitle } from "create/space/spaceSlice"; // 确认路径
import toast from "react-hot-toast";
import { useParams, useSearchParams } from "react-router-dom";
import { CheckIcon } from "@primer/octicons-react";
import DeleteButton from "chat/web/DeleteButton"; // 确认路径
import Button from "render/web/ui/Button"; // 确认路径
import { useTheme } from "app/theme"; // 确认路径
import ModeToggle from "web/ui/ModeToggle"; // 确认路径

export const CreateTool = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const pageState = useAppSelector(selectPageData);
  const isReadOnly = useAppSelector(selectIsReadOnly);
  const dbSpaceId = useAppSelector(selectPageDbSpaceId);

  const { pageKey: dbKey } = useParams<{ pageKey?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  // 修改 CreateTool.tsx 中的模式切换处理函数

  // 处理编辑/只读模式切换的回调函数
  // 处理编辑/只读模式切换的回调函数
  // 处理编辑/只读模式切换的回调函数
  const handleToggleEdit = useCallback(
    (checked: boolean) => {
      // 首先更新 Redux 状态
      dispatch(toggleReadOnly());

      // 然后更新 URL，但不触发重新渲染
      const nextSearchParams = new URLSearchParams(searchParams);

      if (checked) {
        // 切换到编辑模式: 添加或更新 edit=true
        nextSearchParams.set("edit", "true");
      } else {
        // 切换到只读模式: 删除 edit 参数
        nextSearchParams.delete("edit");
      }

      // 更新 URL 但避免历史记录堆栈和滚动位置重置
      setSearchParams(nextSearchParams, {
        replace: true,
        preventScrollReset: true,
      });
    },
    [dispatch, searchParams, setSearchParams]
  );

  // 处理保存按钮点击事件
  const handleSave = useCallback(async () => {
    if (!dbKey) {
      toast.error("无法获取页面标识符，无法保存");
      return;
    }
    const nowISO = formatISO(new Date());
    try {
      const title =
        pageState.slateData?.find((node: any) => node.type === "heading-one")
          ?.children?.[0]?.text || "未命名页面";

      await dispatch(
        patch({
          dbKey,
          changes: {
            updated_at: nowISO,
            slateData: pageState.slateData,
            title,
          },
        })
      ).unwrap();

      if (dbSpaceId) {
        console.log(`[CreateTool] 尝试更新空间标题...`);
        try {
          await dispatch(
            updateContentTitle({
              spaceId: dbSpaceId,
              contentKey: dbKey,
              title,
            })
          ).unwrap();
          console.log(`[CreateTool] 空间标题更新成功。`);
        } catch (spaceError) {
          console.error(`[CreateTool] 更新空间标题失败:`, spaceError);
        }
      } else {
        console.log(`[CreateTool] 跳过空间标题更新...`);
      }

      toast.success("保存成功");

      // 保存成功后切换到只读模式
      // 只使用 Redux 状态，不需要像之前那样直接调用 handleToggleEdit
      dispatch(toggleReadOnly());

      // 更新 URL 但不触发页面重载
      const nextSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.delete("edit");
      setSearchParams(nextSearchParams, { replace: true });
    } catch (error) {
      console.error("保存失败:", error);
      toast.error("保存失败");
    }
  }, [
    dbKey,
    pageState.slateData,
    dispatch,
    dbSpaceId,
    searchParams,
    setSearchParams,
  ]);

  // 如果 dbKey 不存在，提前返回
  if (!dbKey) {
    return (
      <div style={{ padding: "12px 24px", color: theme.textSecondary }}>
        加载工具栏中...
      </div>
    );
  }

  return (
    <>
      <div className="tools-container">
        <div className="title">{pageState.title || "加载中..."}</div>

        <div className="controls">
          <div className="left-group">
            <DeleteButton dbKey={dbKey} />
            <div className="mode-switch">
              <ModeToggle isEdit={!isReadOnly} onChange={handleToggleEdit} />
            </div>
          </div>
          <div className="right-group">
            <Button
              variant="primary"
              icon={<CheckIcon size={16} />}
              onClick={handleSave}
              size="medium"
              disabled={isReadOnly}
              className={isReadOnly ? "hidden" : ""}
            >
              保存
            </Button>
          </div>
        </div>
      </div>

      {/* 样式 */}
      <style>{`
        .tools-container { position: sticky; top: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; background: ${theme.background}; border-bottom: 1px solid ${theme.border}; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
        .title { font-size: 16px; font-weight: 500; color: ${theme.textPrimary}; margin-right: 24px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 50px; flex-shrink: 1; }
        .controls { display: flex; align-items: center; gap: 24px; flex-shrink: 0; }
        .left-group, .right-group { display: flex; align-items: center; gap: 16px; }
        .mode-switch { display: flex; align-items: center; border-radius: 8px; }
        .mode-switch:hover { background: ${theme.backgroundTertiary}; }
        :global(.tools-container button) { transition: all 0.2s ease; }
        :global(.tools-container button:hover:not(:disabled)) { transform: translateY(-1px); box-shadow: 0 2px 4px ${theme.shadowLight}; }
        :global(.tools-container .hidden) { opacity: 0; pointer-events: none; width: 0; padding-left: 0; padding-right: 0; margin-left: -16px; overflow: hidden; }
        @media (max-width: 640px) {
          .tools-container { padding: 8px 16px; }
          .title { display: none; }
          .controls { width: 100%; justify-content: space-between; }
          .left-group { gap: 8px; }
          .right-group { gap: 8px; }
          .controls { gap: 16px; }
        }
      `}</style>
    </>
  );
};
