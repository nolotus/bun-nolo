import { XIcon, PlusIcon, SyncIcon } from "@primer/octicons-react";
import { useFetchData } from "app/hooks";
import { useCouldEdit } from "auth/hooks/useCouldEdit";
import React from "react";
import { Dialog as EditDialog } from "render/web/ui/modal/Dialog";
import { useModal } from "render/ui/Modal";
import AgentForm from "ai/llm/web/AgentForm";

interface BotNameChipProps {
  botKey: string;
  onRemove?: (botKey: string) => void;
  className?: string; // 支持外部传入类名
}

const BotNameChip: React.FC<BotNameChipProps> = React.memo(
  ({ botKey, onRemove, className = "" }) => {
    const { isLoading, data: bot } = useFetchData(botKey);
    const {
      visible: editVisible,
      open: openEdit,
      close: closeEdit,
    } = useModal();
    const allowEdit = useCouldEdit(botKey);

    const displayName = bot?.name || botKey;

    const handleChipClick = (e: React.MouseEvent) => {
      if (allowEdit) {
        e.stopPropagation();
        openEdit();
      }
    };

    const handleRemoveClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove?.(botKey);
    };

    return (
      <>
        <div
          className={`bot-chip-wrapper ${className} ${allowEdit ? "editable" : ""} ${onRemove ? "has-remove" : ""}`}
          onClick={handleChipClick}
          role={allowEdit ? "button" : undefined}
          tabIndex={allowEdit ? 0 : undefined}
          title={allowEdit ? "点击编辑" : displayName}
        >
          {/* 名称区域 */}
          <span className="bot-chip-label">
            {isLoading ? "Loading..." : displayName}
          </span>

          {/* 移除按钮 */}
          {onRemove && (
            <button
              className="bot-chip-remove-button"
              onClick={handleRemoveClick}
              aria-label={`移除 ${displayName}`}
              type="button"
            >
              <XIcon size={14} />
            </button>
          )}
        </div>

        {/* 编辑弹窗 */}
        {allowEdit && editVisible && bot && (
          <EditDialog
            isOpen={editVisible}
            onClose={closeEdit}
            title={`编辑 ${bot.name || "Bot"}`}
            // 使用之前优化过的 Dialog，size 可以设为 medium
            size="medium"
          >
            <AgentForm
              mode="edit"
              initialValues={bot}
              onClose={closeEdit}
              CreateIcon={PlusIcon}
              EditIcon={SyncIcon}
            />
          </EditDialog>
        )}

        <style href="bot-name-chip" precedence="component">{`
          .bot-chip-wrapper {
            display: inline-flex;
            align-items: center;
            height: 28px; /* 固定一个舒适的高度 */
            max-width: 100%;
            padding: 0 8px 0 10px; /* 如果有删除按钮，右边距由按钮处理 */
            
            background-color: var(--backgroundSecondary);
            border: 1px solid var(--border);
            border-radius: 999px; /* Pill shape */
            
            color: var(--textSecondary);
            font-size: 13px;
            user-select: none;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            
            /* 细微的拟物光泽 */
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          }

          /* 有删除按钮时，右侧 padding 减小，交给按钮 */
          .bot-chip-wrapper.has-remove {
            padding-right: 4px; 
          }

          /* 可编辑/交互状态 */
          .bot-chip-wrapper.editable {
            cursor: pointer;
            color: var(--text);
          }

          .bot-chip-wrapper.editable:hover {
            background-color: var(--backgroundHover);
            border-color: var(--borderHover);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
            transform: translateY(-1px);
          }
          
          .bot-chip-wrapper.editable:active {
            transform: translateY(0);
            background-color: var(--backgroundSelected);
          }

          .bot-chip-label {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 150px; /* 限制最大宽度，防止撑破布局 */
            line-height: 1;
            padding-top: 1px; /* 视觉微调 */
          }

          /* 移除按钮 */
          .bot-chip-remove-button {
            display: flex;
            align-items: center;
            justify-content: center;
            
            width: 20px;
            height: 20px;
            margin-left: 4px;
            border-radius: 50%;
            
            background: transparent;
            border: none;
            color: var(--textTertiary);
            cursor: pointer;
            transition: all 0.2s ease;
            
            opacity: 0.7;
          }

          .bot-chip-remove-button:hover {
            background-color: rgba(0, 0, 0, 0.06); /* 通用浅色背景 */
            color: var(--error);
            opacity: 1;
          }
          
          /* 暗黑模式下 hover 背景微调 */
          @media (prefers-color-scheme: dark) {
            .bot-chip-remove-button:hover {
               background-color: rgba(255, 255, 255, 0.1);
            }
          }

          /* 在列表中全宽展示 */
          .bot-dialog-list .bot-chip-wrapper {
            width: 100%;
            box-sizing: border-box;
            justify-content: space-between;
          }
        `}</style>
      </>
    );
  }
);

export default BotNameChip;
