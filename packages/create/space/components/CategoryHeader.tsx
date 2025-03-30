import React from "react"; // 引入 React
import { useAppDispatch, useAppSelector } from "app/hooks";
import { useTheme } from "app/theme";
import { ConfirmModal } from "web/ui/ConfirmModal";
import { BaseActionModal } from "web/ui/BaseActionModal";
import Button from "web/ui/Button";
import {
  XIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ChevronDownIcon,
} from "@primer/octicons-react";
import {
  updateCategoryName,
  deleteCategory,
  selectCurrentSpaceId,
  // 导入新 action 和 selector
  toggleCategoryCollapse,
  selectCollapsedCategories,
} from "create/space/spaceSlice";
import { createPage } from "render/page/pageSlice";
import { DraggableSyntheticListeners } from "@dnd-kit/core";
import { useNavigate } from "react-router-dom";

interface CategoryHeaderProps {
  categoryId: string;
  categoryName: string;
  onEdit?: (categoryId: string, newName: string) => void; // 可选的回调
  onDelete?: (categoryId: string) => void; // 可选的回调
  isDragOver?: boolean; // 是否有东西悬停在其上
  handleProps?: DraggableSyntheticListeners; // dnd-kit 拖拽句柄
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  categoryId,
  categoryName = "", // 提供默认值
  onEdit,
  onDelete,
  isDragOver,
  handleProps,
}) => {
  // 本地状态用于模态框和输入
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState(categoryName);

  const dispatch = useAppDispatch();
  const theme = useTheme();
  const spaceId = useAppSelector(selectCurrentSpaceId);
  const navigate = useNavigate();

  // 从 Redux 获取折叠状态
  const collapsedCategories = useAppSelector(selectCollapsedCategories);
  const isCollapsed = collapsedCategories[categoryId] ?? false;

  // 判断是否是“未分类”
  const isUncategorized = categoryId === "uncategorized";

  // 点击折叠/展开按钮的处理函数
  const handleToggleCollapse = React.useCallback(() => {
    // 现在允许折叠 "未分类"
    if (categoryId) {
      dispatch(toggleCategoryCollapse(categoryId));
    }
  }, [dispatch, categoryId]);

  // 编辑按钮点击处理
  const handleEdit = () => {
    setNewCategoryName(categoryName); // 重置输入框为当前名称
    setIsEditModalOpen(true);
  };

  // 确认编辑处理
  const handleConfirmEdit = () => {
    const trimmedName = newCategoryName?.trim();
    if (trimmedName && trimmedName !== categoryName && spaceId) {
      if (onEdit) {
        // 如果提供了外部回调，则调用它
        onEdit(categoryId, trimmedName);
      } else {
        // 否则，dispatch Redux action
        dispatch(
          updateCategoryName({
            spaceId,
            categoryId,
            name: trimmedName,
          })
        );
      }
      setIsEditModalOpen(false);
    } else if (!trimmedName) {
      // 提示名称不能为空（如果需要）
      console.warn("Category name cannot be empty.");
    }
  };

  // 删除按钮点击处理
  const handleDelete = () => setIsDeleteModalOpen(true);

  // 确认删除处理
  const handleConfirmDelete = () => {
    // 仍然不允许删除未分类
    if (spaceId && categoryId && !isUncategorized) {
      if (onDelete) {
        // 如果提供了外部回调
        onDelete(categoryId);
      } else {
        // 否则，dispatch Redux action
        dispatch(deleteCategory({ spaceId, categoryId }));
      }
    }
    setIsDeleteModalOpen(false); // 关闭模态框
  };

  // 添加页面按钮处理
  const handleAddPage = async () => {
    if (!spaceId) return;
    try {
      // dispatch 创建页面的 action，需要 categoryId 参数
      const resultAction = await dispatch(createPage({ categoryId }));
      // unwrap 会在成功时返回值，失败时抛出错误
      const dbKey = resultAction.payload as string; // 假设 payload 是 dbKey
      if (dbKey) {
        navigate(`/${dbKey}?edit=true`); // 跳转到新页面并进入编辑模式
      }
    } catch (error) {
      console.error("Failed to create page:", error);
      // 这里可以添加用户反馈，例如 toast 通知
    }
  };

  // 动态计算类名
  const headerClassName = `CategoryHeader ${isDragOver ? "CategoryHeader--drag-over" : ""}`;
  const collapseButtonClassName = `CategoryHeader__collapseButton ${isCollapsed ? "CategoryHeader__collapseButton--collapsed" : ""}`;
  // 根据是否未分类应用不同的名称样式和拖拽属性
  const nameClassName = `CategoryHeader__name ${!isUncategorized ? "CategoryHeader__name--draggable" : ""}`;
  const nameProps = !isUncategorized && handleProps ? handleProps : {};

  return (
    <>
      <div className={headerClassName}>
        {/* 折叠/展开按钮 (现在总是显示) */}
        <span
          className={collapseButtonClassName}
          onClick={handleToggleCollapse}
          title={isCollapsed ? "展开分类" : "折叠分类"}
        >
          <ChevronDownIcon size={18} />
        </span>

        {/* 分类名称 */}
        <span
          className={nameClassName}
          {...nameProps} // 应用拖拽监听器 (仅非未分类)
          title={!isUncategorized ? "拖拽以调整分类顺序" : categoryName} // Tooltip
        >
          {categoryName}
        </span>

        {/* 操作按钮区域 */}
        <div className="CategoryHeader__actions">
          {/* 添加页面按钮 */}
          <button
            className="CategoryHeader__actionButton CategoryHeader__actionButton--add"
            onClick={handleAddPage}
            title="在此分类下新建页面"
          >
            <PlusIcon size={14} />
          </button>

          {/* 编辑和删除按钮 (仅对非“未分类”显示) */}
          {!isUncategorized && (
            <>
              <button
                className="CategoryHeader__actionButton CategoryHeader__actionButton--edit"
                onClick={handleEdit}
                title="编辑分类名称"
              >
                <PencilIcon size={14} />
              </button>
              <button
                className="CategoryHeader__actionButton CategoryHeader__actionButton--delete"
                onClick={handleDelete}
                title="删除分类"
              >
                <TrashIcon size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* 编辑分类名称模态框 (仅非未分类) */}
      {!isUncategorized && (
        <BaseActionModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="编辑分类名称"
          status="info"
          headerExtra={
            <button
              className="CategoryHeader__modalCloseButton"
              onClick={() => setIsEditModalOpen(false)}
              aria-label="关闭"
            >
              <XIcon size={16} />
            </button>
          }
          actions={
            <>
              <Button
                variant="secondary"
                size="small"
                onClick={() => setIsEditModalOpen(false)}
              >
                取消
              </Button>
              <Button
                variant="primary"
                size="small"
                onClick={handleConfirmEdit}
                disabled={
                  !newCategoryName?.trim() || // 检查是否为空或只有空格
                  newCategoryName.trim() === categoryName // 检查是否与原名称相同
                }
              >
                确认
              </Button>
            </>
          }
          width={400}
        >
          <input
            type="text"
            value={newCategoryName || ""} // 处理 null 或 undefined
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="CategoryHeader__editInput"
            placeholder="请输入新的分类名称"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                // 只有在按钮不 disabled 的情况下才响应 Enter
                if (
                  newCategoryName?.trim() &&
                  newCategoryName.trim() !== categoryName
                ) {
                  handleConfirmEdit();
                }
              } else if (e.key === "Escape") {
                setIsEditModalOpen(false);
              }
            }}
          />
        </BaseActionModal>
      )}

      {/* 删除分类确认模态框 (仅非未分类) */}
      {!isUncategorized && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="删除分类"
          message={`确定要删除分类 "${categoryName}" 吗？该分类下的所有内容将被移至“未分类”。此操作无法撤销。`}
          confirmText="确认删除"
          cancelText="取消"
          type="error" // 或 "warning"
          showCancel={true}
        />
      )}

      {/* CSS 样式 (保持不变) */}
      <style id="category-header-styles">
        {`
        .CategoryHeader {
          box-sizing: border-box;
          padding: 7px 10px; /* 统一内边距 */
          display: flex;
          align-items: center;
          gap: 8px; /* 调整间距 */
          border-radius: 8px;
          transition: background-color 0.15s ease;
          user-select: none;
          cursor: default;
          min-height: 36px; /* 最小高度 */
          position: relative;
          /* margin: 8px 0 2px 0; /* 可根据需要调整外边距 */
        }

        .CategoryHeader:hover {
          background-color: ${theme?.backgroundHover || "rgba(0,0,0,0.03)"};
        }

        /* 当有拖拽物悬停在分类上时的背景 */
        .CategoryHeader--drag-over {
          /* 这个样式应该由父级 .ChatSidebar__category--drag-over 控制，Header 本身不变色 */
        }

        /* 折叠按钮 */
        .CategoryHeader__collapseButton {
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${theme?.textTertiary || "#999"};
          cursor: pointer;
          border-radius: 6px;
          transition: transform 0.2s ease, color 0.2s ease, background-color 0.2s ease;
          flex-shrink: 0; /* 防止被压缩 */
          padding: 3px; /* 内边距 */
          width: 24px; /* 固定宽度 */
          height: 24px; /* 固定高度 */
          box-sizing: border-box;
        }

        .CategoryHeader__collapseButton:hover {
          color: ${theme?.textSecondary || "#666"};
          background-color: ${theme?.backgroundTertiary || "rgba(0,0,0,0.06)"};
        }

        /* 折叠状态下的旋转 */
        .CategoryHeader__collapseButton--collapsed {
          transform: rotate(-90deg);
        }

        /* 分类名称 */
        .CategoryHeader__name {
          font-size: 14px;
          font-weight: 600;
          color: ${theme?.text || "#333"};
          flex-grow: 1; /* 占据剩余空间 */
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          min-width: 0; /* 防止 flex 溢出 */
          line-height: 1.4;
          letter-spacing: -0.01em;
          padding: 2px 0; /* 垂直方向微调 */
        }

        /* 可拖拽的分类名称样式 */
        .CategoryHeader__name--draggable {
          cursor: grab;
          position: relative; /* 用于可能的伪元素效果 */
          padding-left: 4px; /* 微调可拖拽区域 */
          margin-left: -4px;
          padding-right: 4px;
        }

        .CategoryHeader__name--draggable:active {
          cursor: grabbing;
        }

        /* 可选：为可拖拽区域添加视觉反馈 */
        .CategoryHeader__name--draggable:hover::before {
          content: "";
          position: absolute;
          inset: -2px -4px; /* 覆盖区域 */
          background-color: rgba(0, 0, 0, 0.03);
          border-radius: 4px;
          z-index: -1; /* 置于文本下方 */
          pointer-events: none;
        }


        /* 操作按钮容器 */
        .CategoryHeader__actions {
          display: flex;
          gap: 2px; /* 按钮间距 */
          align-items: center;
          margin-left: auto; /* 推到最右边 */
          opacity: 0; /* 默认隐藏 */
          transition: opacity 0.15s ease;
          flex-shrink: 0; /* 防止被压缩 */
        }

        /* 悬停时显示操作按钮 */
        .CategoryHeader:hover .CategoryHeader__actions {
          opacity: 1;
        }
         /* 当Header被拖拽时，也显示按钮 */
        .CategoryDraggable--dragging .CategoryHeader__actions {
             opacity: 1;
        }

        /* 单个操作按钮 */
        .CategoryHeader__actionButton {
          padding: 4px;
          background: none;
          border: none;
          color: ${theme?.textTertiary || "#999"};
          cursor: pointer;
          display: flex;
          align-items: center;
          border-radius: 4px;
          transition: color 0.2s ease, background-color 0.2s ease;
        }

        .CategoryHeader__actionButton:hover {
          background-color: ${theme?.backgroundTertiary || "rgba(0,0,0,0.06)"};
        }

        /* 特定按钮的悬停颜色 */
        .CategoryHeader__actionButton--add:hover {
          color: ${theme?.success || "#52c41a"};
        }
        .CategoryHeader__actionButton--edit:hover {
          color: ${theme?.primary || "#1677ff"};
        }
        .CategoryHeader__actionButton--delete:hover {
          color: ${theme?.error || "#ff4d4f"};
        }

        /* 模态框关闭按钮 */
        .CategoryHeader__modalCloseButton {
          background: none;
          border: none;
          color: ${theme?.textSecondary || "#666"};
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
        }

        .CategoryHeader__modalCloseButton:hover {
          color: ${theme?.text || "#333"};
        }

        /* 编辑输入框 */
        .CategoryHeader__editInput {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid ${theme?.border || "#d9d9d9"};
          border-radius: 6px;
          background: ${theme?.background || "#fff"};
          color: ${theme?.text || "#333"};
          outline: none;
          font-size: 14px;
          box-sizing: border-box;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .CategoryHeader__editInput:focus {
          border-color: ${theme?.primary || "#1677ff"};
          box-shadow: 0 0 0 2px ${theme?.primary ? `${theme.primary}33` : "rgba(22, 119, 255, 0.2)"}; /* 减淡阴影 */
        }
      `}
      </style>
    </>
  );
};

// 使用 React.memo 优化，仅在 props 变化时重新渲染
export default React.memo(CategoryHeader);
