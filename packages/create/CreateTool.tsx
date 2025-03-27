import React from "react"; // 引入 React
import { useAppDispatch, useAppSelector } from "app/hooks";
import { formatISO } from "date-fns";
import { patchData } from "database/dbSlice";
import {
  selectPageData,
  selectIsReadOnly,
  toggleReadOnly,
  selectPageDbSpaceId, // **** 导入获取 dbSpaceId 的 selector ****
} from "render/page/pageSlice";
import { updateContentTitle } from "create/space/spaceSlice";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom"; // 确保导入 useParams
import { CheckIcon } from "@primer/octicons-react";
import DeleteButton from "chat/web/DeleteButton"; // 确认路径正确
import Button from "web/ui/Button"; // 确认路径正确
import { useTheme } from "app/theme"; // 确认路径正确
import ModeToggle from "web/ui/ModeToggle"; // 确认路径正确

export const CreateTool = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const pageState = useAppSelector(selectPageData); // 获取整个 page slice state
  const isReadOnly = useAppSelector(selectIsReadOnly);
  const dbSpaceId = useAppSelector(selectPageDbSpaceId); // **** 获取页面所属的 dbSpaceId ****

  // 从 useParams 获取 pageKey 并重命名为 dbKey
  const { pageKey: dbKey } = useParams<{ pageKey?: string }>();

  const handleToggleEdit = (checked: boolean) => {
    dispatch(toggleReadOnly());
    if (dbKey) {
      // 确保 dbKey 存在
      navigate(`/${dbKey}${!checked ? "" : "?edit=true"}`);
    }
  };

  const handleSave = async () => {
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
        patchData({
          dbKey, // 使用 dbKey (持有 pageKey 的值)
          changes: {
            updated_at: nowISO,
            slateData: pageState.slateData,
            title,
          },
        })
      ).unwrap();

      // **** 使用从 slice 获取的 dbSpaceId ****
      if (dbSpaceId) {
        console.log(
          `[CreateTool] Attempting to update space title for page ${dbKey} in space ${dbSpaceId}`
        );
        try {
          await dispatch(
            updateContentTitle({
              spaceId: dbSpaceId, // 使用 dbSpaceId
              contentKey: dbKey,
              title,
            })
          ).unwrap();
          console.log(
            `[CreateTool] Successfully updated space title for page ${dbKey}.`
          );
        } catch (spaceError) {
          console.error(
            `[CreateTool] Failed to update space title for page ${dbKey}:`,
            spaceError
          );
        }
      } else {
        console.log(
          `[CreateTool] Skipping space title update for page ${dbKey} as dbSpaceId is not available.`
        );
      }

      toast.success("保存成功");
      handleToggleEdit(false); // 保存成功后切换回只读模式
    } catch (error) {
      console.error("Save failed:", error);
      toast.error("保存失败");
    }
  };

  // 如果 dbKey 不存在，可以提前返回
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
        {/* 使用 pageState 中的 title */}
        <div className="title">{pageState.title || "加载中..."}</div>

        <div className="controls">
          <div className="left-group">
            {/* DeleteButton 接收 dbKey */}
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
        .tools-container { position: sticky; top: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; background: ${theme.background}; border-bottom: 1px solid ${theme.border}; backdrop-filter: blur(8px); }
        .title { font-size: 16px; font-weight: 500; color: ${theme.textPrimary}; margin-right: 24px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 50px; }
        .controls { display: flex; align-items: center; gap: 24px; flex-shrink: 0; }
        .left-group, .right-group { display: flex; align-items: center; gap: 16px; }
        .mode-switch { display: flex; align-items: center; }
        .mode-switch:hover { background: ${theme.backgroundTertiary}; }
        :global(.tools-container button) { transition: all 0.2s ease; }
        :global(.tools-container button:hover:not(:disabled)) { transform: translateY(-1px); box-shadow: 0 2px 4px ${theme.shadowLight}; }
        :global(.tools-container .hidden) { opacity: 0; pointer-events: none; }
        @media (max-width: 640px) { .tools-container { padding: 8px 16px; } .title { display: none; } .controls { width: 100%; justify-content: space-between; } }
      `}</style>
    </>
  );
};

// 如果 CreateTool 不是默认导出，可能需要调整
// export default CreateTool;
