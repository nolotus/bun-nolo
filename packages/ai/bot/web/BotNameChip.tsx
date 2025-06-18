import { XIcon } from "@primer/octicons-react";
import { useFetchData } from "app/hooks";
import { useCouldEdit } from "auth/hooks/useCouldEdit";
import React from "react";
import { Dialog as EditDialog } from "render/web/ui/Dialog";
import { useModal } from "render/ui/Modal";
import { useTheme } from "app/theme";
import CybotForm from "./BotForm";
import { PlusIcon, SyncIcon } from "@primer/octicons-react";

// 定义组件的 props 接口
interface BotNameChipProps {
  botKey: string;
  /** 可选回调函数，用于从当前上下文中移除 Bot */
  onRemove?: (botKey: string) => void;
}

// 使用 React.memo 优化组件性能
const BotNameChip: React.FC<BotNameChipProps> = React.memo(
  ({ botKey, onRemove }) => {
    // 获取主题、数据、编辑权限和模态框状态
    const theme = useTheme();
    const { isLoading, data: bot } = useFetchData(botKey);
    const {
      visible: editVisible,
      open: openEdit,
      close: closeEdit,
    } = useModal();
    const allowEdit = useCouldEdit(botKey);

    // 显示名称，优先使用 bot.name，没有则回退到 botKey
    const displayName = bot?.name || botKey;

    // 处理点击 Chip 的事件，允许编辑时打开编辑框
    const handleChipClick = (e: React.MouseEvent) => {
      if (allowEdit) {
        e.stopPropagation(); // 阻止事件冒泡
        openEdit();
      }
    };

    // 处理点击移除按钮的事件
    const handleRemoveClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // 阻止事件冒泡
      onRemove?.(botKey); // 使用可选链式调用简化条件判断
    };

    return (
      <>
        {/* Chip 和移除按钮的容器 */}
        <div className="bot-chip-wrapper">
          {/* 显示名称的 Chip */}
          <span
            className={`bot-chip ${allowEdit ? "editable" : ""}`}
            title={displayName}
            onClick={handleChipClick}
            role={allowEdit ? "button" : undefined}
            tabIndex={allowEdit ? 0 : undefined}
            onKeyDown={
              allowEdit
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleChipClick(e as any);
                    }
                  }
                : undefined
            }
          >
            {displayName}
          </span>

          {/* 移除按钮，onRemove 存在时显示 */}
          {onRemove && (
            <button
              className="bot-chip-remove-button"
              onClick={handleRemoveClick}
              aria-label={`Remove ${displayName}`}
              title={`Remove ${displayName}`}
            >
              <XIcon size={12} />
            </button>
          )}
        </div>

        {/* 编辑对话框，只有允许编辑且数据存在时显示 */}
        {allowEdit && editVisible && bot && (
          <EditDialog
            isOpen={editVisible}
            onClose={closeEdit}
            title={`Edit ${bot.name || "Bot"}`}
          >
            <CybotForm // 组件名保留，但内部可能处理bot
              mode="edit"
              initialValues={bot}
              onClose={closeEdit}
              CreateIcon={PlusIcon}
              EditIcon={SyncIcon}
            />
          </EditDialog>
        )}

        {/* 组件样式 */}
        <style>
          {`
          .bot-chip-wrapper {
            display: inline-flex;
            align-items: center;
            background-color: ${theme.surface2};
            border-radius: 16px;
            border: 1px solid ${theme.border};
            overflow: hidden;
            transition: all 0.2s ease;
            max-width: 100%;
          }
          .bot-chip-wrapper:hover {
            border-color: ${theme.borderHover};
            background-color: ${theme.surfaceHighlight};
          }

          .bot-chip {
            font-size: 13px;
            padding: 5px 12px;
            color: ${theme.textSecondary};
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            cursor: default;
            flex-grow: 1;
            min-width: 0;
          }
          .bot-chip.editable {
            cursor: pointer;
            color: ${theme.text};
          }

          .bot-chip-remove-button {
            display: flex;
            align-items: center;
            justify-content: center;
            background: none;
            border: none;
            color: ${theme.textSecondary};
            cursor: pointer;
            padding: 6px;
            margin-right: 4px;
            border-radius: 50%;
            line-height: 0;
            transition: all 0.15s ease;
            flex-shrink: 0;
          }
          .bot-chip-remove-button:hover {
            background-color: ${theme.dangerMuted};
            color: ${theme.dangerFg};
          }
          .bot-chip-remove-button:active {
            transform: scale(0.9);
          }

          .bot-dialog-list .bot-chip-wrapper {
            width: 100%;
            box-sizing: border-box;
          }
        `}
        </style>
      </>
    );
  }
);

export default BotNameChip;
