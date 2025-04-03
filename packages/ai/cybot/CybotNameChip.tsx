import { XIcon } from "@primer/octicons-react"; // 需要 XIcon
import { useFetchData } from "app/hooks";
import { useCouldEdit } from "auth/hooks/useCouldEdit";
import React from "react";
import { Dialog as EditDialog } from "render/web/ui/Dialog"; // 重命名以区分
import { useModal } from "render/ui/Modal";
import { useTheme } from "app/theme";
import QuickEditCybot from "./web/QuickEditCybot"; // 假设这个路径正确

interface CybotNameChipProps {
  cybotId: string;
  /** 可选的回调函数，用于从当前上下文中移除此 Cybot (例如，从对话中移除) */
  onRemove?: (cybotId: string) => void;
}

const CybotNameChip: React.FC<CybotNameChipProps> = React.memo(
  ({ cybotId, onRemove }) => {
    const theme = useTheme();
    const { isLoading, data: cybot } = useFetchData(cybotId);
    const {
      visible: editVisible,
      open: openEdit,
      close: closeEdit,
    } = useModal();
    const allowEdit = useCouldEdit(cybotId);

    if (isLoading || !cybot) return null; // 添加 !cybot 检查

    const displayName = cybot?.name || cybotId; // Fallback to ID if name is missing

    const handleChipClick = (e: React.MouseEvent) => {
      // 只有在允许编辑且没有提供 onRemove 函数时（或点击的不是移除按钮时），才打开编辑框
      // 或者，我们让名称部分总是可点击编辑，移除按钮单独处理
      if (allowEdit) {
        e.stopPropagation(); // 阻止冒泡到 Dialog 关闭等
        openEdit();
      }
    };

    const handleRemoveClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // 阻止事件冒泡（例如，阻止触发 handleChipClick）
      if (onRemove) {
        onRemove(cybotId); // 调用移除回调
      }
    };

    return (
      <>
        {/* 将 Chip 和移除按钮包裹在一个容器中 */}
        <div className="cybot-chip-wrapper">
          <span
            className={`cybot-chip ${allowEdit ? "editable" : ""}`}
            title={displayName}
            onClick={handleChipClick} // 点击名称区域进行编辑
            role={allowEdit ? "button" : undefined}
            tabIndex={allowEdit ? 0 : undefined}
            onKeyDown={
              allowEdit
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ")
                      handleChipClick(e as any);
                  }
                : undefined
            }
          >
            {displayName}
          </span>

          {/* 如果提供了 onRemove 回调，则显示移除按钮 */}
          {onRemove && (
            <button
              className="cybot-chip-remove-button"
              onClick={handleRemoveClick}
              aria-label={`Remove ${displayName}`}
              title={`Remove ${displayName}`}
            >
              <XIcon size={12} />
            </button>
          )}
        </div>

        {/* 编辑 Cybot 的 Dialog 保持不变 */}
        {allowEdit && editVisible && cybot && (
          <EditDialog
            isOpen={editVisible}
            onClose={closeEdit}
            title={`Edit ${cybot.name || "Cybot"}`}
          >
            <QuickEditCybot initialValues={cybot} onClose={closeEdit} />
          </EditDialog>
        )}

        {/* --- 样式 --- */}
        <style>
          {`
          .cybot-chip-wrapper {
            display: inline-flex; /* 让容器包裹内容 */
            align-items: center;
            background-color: ${theme.surface2}; /* 将背景应用到 wrapper */
            border-radius: 16px; /* 圆角应用到 wrapper */
            border: 1px solid ${theme.border};
            overflow: hidden; /* 确保子元素在圆角内 */
            transition: all 0.2s ease;
            max-width: 100%; /* 允许在父容器中正常换行或限制 */
          }
          .cybot-chip-wrapper:hover {
             border-color: ${theme.borderHover};
             background-color: ${theme.surfaceHighlight}; /* 整体悬停效果 */
          }

          .cybot-chip {
            font-size: 13px;
            padding: 5px 12px; /* 调整内边距 */
            color: ${theme.textSecondary};
            /* 移除背景和边框，移到 wrapper 上 */
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            cursor: default; /* 默认不可点击 */
            flex-grow: 1; /* 让名称部分占据可用空间 */
            min-width: 0; /* 允许在 flex 容器中缩小 */
          }

          .cybot-chip.editable {
            cursor: pointer; /* 只有可编辑时才显示指针 */
            color: ${theme.text}; /* 可编辑时颜色可能不同 */
          }
          .cybot-chip.editable:hover {
            /* 可以添加名称部分的特定悬停效果，如果需要的话 */
             /* background-color: ${theme.backgroundGhost}; */
          }


          .cybot-chip-remove-button {
            display: flex;
            align-items: center;
            justify-content: center;
            background: none;
            border: none;
            color: ${theme.textSecondary};
            cursor: pointer;
            padding: 6px; /* 点击区域 */
            margin-right: 4px; /* 与右边缘的距离 */
            border-radius: 50%;
            line-height: 0; /* 避免影响高度 */
            transition: all 0.15s ease;
            flex-shrink: 0; /* 防止按钮被压缩 */
          }

          .cybot-chip-remove-button:hover {
            background-color: ${theme.dangerMuted}; /* 危险操作的悬停背景 */
            color: ${theme.dangerFg}; /* 危险操作的悬停文字/图标颜色 */
          }
          .cybot-chip-remove-button:active {
            transform: scale(0.9);
          }

          /* 确保在 Dialog 中正常显示 */
          .cybot-dialog-list .cybot-chip-wrapper {
             width: 100%; /* 在 Dialog 列表中占满宽度 */
             box-sizing: border-box;
          }
        `}
        </style>
      </>
    );
  }
);

export default CybotNameChip;
