import { useState } from "react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { useTheme } from "app/theme";
import { ConfirmModal } from "web/ui/ConfirmModal";
import { BaseActionModal } from "web/ui/BaseActionModal";
import Button from "web/ui/Button";
import {
  XIcon,
  PencilIcon,
  TrashIcon,
  GrabberIcon,
  PlusIcon,
} from "@primer/octicons-react";
import {
  updateCategoryName,
  deleteCategory,
  selectCurrentSpaceId,
} from "create/space/spaceSlice";
import { createPage } from "render/page/pageSlice";
import { DraggableSyntheticListeners } from "@dnd-kit/core";
import { useNavigate } from "react-router-dom";

interface CategoryHeaderProps {
  categoryId: string;
  categoryName: string;
  onEdit?: (categoryId: string, newName: string) => void;
  onDelete?: (categoryId: string) => void;
  // isDragOver 属性用于拖拽悬浮样式
  isDragOver?: boolean;
  // handleProps 用于拖拽
  handleProps?: DraggableSyntheticListeners;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  categoryId,
  categoryName,
  onEdit,
  onDelete,
  isDragOver,
  handleProps,
}) => {
  // isHovered state 不再直接控制按钮样式，但可用于其他悬停逻辑（如果需要）
  // const [isHovered, setIsHovered] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState(categoryName);

  const dispatch = useAppDispatch();
  const theme = useTheme();
  const spaceId = useAppSelector(selectCurrentSpaceId);
  const navigate = useNavigate();

  const isUncategorized = categoryName === "未分类";

  const handleEdit = () => {
    setNewCategoryName(categoryName);
    setIsEditModalOpen(true);
  };

  const handleConfirmEdit = () => {
    if (
      newCategoryName &&
      newCategoryName.trim() &&
      newCategoryName !== categoryName &&
      spaceId
    ) {
      if (onEdit) {
        onEdit(categoryId, newCategoryName.trim());
      } else {
        dispatch(
          updateCategoryName({
            spaceId,
            categoryId,
            name: newCategoryName.trim(),
          })
        );
      }
      setIsEditModalOpen(false);
    } else if (!newCategoryName.trim()) {
      // 可选：提示名称不能为空
      console.warn("Category name cannot be empty.");
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (spaceId) {
      if (onDelete) {
        onDelete(categoryId);
      } else {
        dispatch(
          deleteCategory({
            spaceId,
            categoryId,
          })
        );
      }
    }
    setIsDeleteModalOpen(false);
  };

  const handleAddPage = async () => {
    if (!spaceId) {
      console.error("Cannot create page without a current space ID.");
      return;
    }
    try {
      const dbKey = await dispatch(createPage({ categoryId })).unwrap();
      navigate(`/${dbKey}?edit=true`);
    } catch (error) {
      console.error("Failed to create page:", error);
      // 添加用户反馈，例如 toast 通知
    }
  };

  // 应用精确化的 CSS 类名，并根据 isDragOver 添加修饰符
  const headerClassName = `CategoryHeader ${isDragOver ? "CategoryHeader--drag-over" : ""}`;

  return (
    <>
      <div
        className={headerClassName}
        // 移除 onMouseEnter/Leave，因为显隐由 CSS :hover 控制
        // onMouseEnter={() => setIsHovered(true)}
        // onMouseLeave={() => setIsHovered(false)}
      >
        {/* 拖拽手柄 */}
        {!isUncategorized && handleProps && (
          // 应用精确化的 CSS 类名
          <span
            className="CategoryHeader__dragHandle"
            {...handleProps}
            title="拖拽以移动"
          >
            {/* 移除内联 style 控制 opacity */}
            <GrabberIcon size={16} />
          </span>
        )}
        {/* 占位符，用于未分类项保持对齐 */}
        {isUncategorized && (
          <span className="CategoryHeader__dragHandlePlaceholder"></span>
        )}

        {/* 分类名称 */}
        <span className="CategoryHeader__name">{categoryName}</span>

        {/* 操作按钮区域 */}
        {/* 应用精确化的 CSS 类名 */}
        <div className="CategoryHeader__actions">
          {/* 添加按钮 */}
          <button
            // 应用精确化的 CSS 类名
            className="CategoryHeader__actionButton CategoryHeader__actionButton--add"
            onClick={handleAddPage}
            title="新建页面"
            // 移除内联 style 控制 opacity
          >
            <PlusIcon size={14} />
          </button>

          {/* 编辑和删除按钮 */}
          {!isUncategorized && (
            <>
              <button
                className="CategoryHeader__actionButton CategoryHeader__actionButton--edit"
                onClick={handleEdit}
                title="编辑分类"
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

      {/* 编辑模态框 */}
      {!isUncategorized && (
        <BaseActionModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="编辑分类名称"
          status="info"
          headerExtra={
            <button
              className="CategoryHeader__modalCloseButton" // 精确化类名
              onClick={() => setIsEditModalOpen(false)}
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
                // 检查 trim 后的名称是否为空或与原名称相同
                disabled={
                  !newCategoryName.trim() ||
                  newCategoryName.trim() === categoryName
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
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="CategoryHeader__editInput" // 精确化类名
            placeholder="请输入新的分类名称"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                // 触发确认逻辑，如果按钮未禁用
                if (
                  newCategoryName.trim() &&
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

      {/* 删除确认模态框 */}
      {!isUncategorized && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="删除分类"
          message={`确定要删除分类 "${categoryName}" 吗？该分类下的所有内容将被移至“未分类”。`}
          confirmText="删除"
          cancelText="取消"
          type="error"
          showCancel={true}
        />
      )}

      {/* 更新 CSS 选择器 */}
      <style>
        {`
          .CategoryHeader {
            box-sizing: border-box;
            padding: 6px 8px;
            display: flex;
            align-items: center;
            border-radius: 6px;
            background-color: transparent;
            border: 1px solid transparent;
            transition: background-color 0.2s ease-out;
            user-select: none;
            cursor: default;
            min-height: 32px;
            position: relative; /* 添加 relative 定位以便绝对定位子元素（如果需要） */
          }

          .CategoryHeader:hover {
            background-color: ${theme.backgroundGhost};
          }

          /* drag-over 状态的样式 */
          .CategoryHeader--drag-over {
            /* 可以使用背景色或边框来指示 */
             background-color: ${theme.primaryGhost || "rgba(22, 119, 255, 0.06)"};
             /* border: 1px dashed ${theme.primaryLight || "#91caff"}; */
          }

          .CategoryHeader__dragHandle {
            cursor: grab;
            color: ${theme.textTertiary};
            display: flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
            border-radius: 4px;
            margin-right: 4px;
            flex-shrink: 0;
            /* 默认隐藏，仅在父元素 hover 时显示 */
            opacity: 0;
            transition: opacity 0.15s ease-out, color 0.2s ease-out, background-color 0.2s ease-out;
          }
           /* 父元素 hover 时显示拖拽手柄 */
          .CategoryHeader:hover .CategoryHeader__dragHandle {
               opacity: 1;
          }

          .CategoryHeader__dragHandle:hover {
            color: ${theme.textSecondary};
            background-color: ${theme.backgroundSecondary};
          }

          .CategoryHeader__dragHandle:active {
            color: ${theme.primary};
            background-color: ${theme.primaryGhost};
            cursor: grabbing;
          }

          .CategoryHeader__dragHandlePlaceholder {
            display: block;
            width: 20px;
            margin-right: 4px;
            flex-shrink: 0;
          }


          .CategoryHeader__name {
            font-size: 14px;
            font-weight: 500;
            color: ${theme.textSecondary};
            flex-grow: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            /* 关键：允许 flex item 在空间不足时收缩 */
            min-width: 0;
            padding: 2px 0;
          }

          .CategoryHeader__actions {
            display: flex;
            gap: 2px;
            align-items: center;
            flex-shrink: 0;
            margin-left: 8px;
            /* 默认隐藏 */
            opacity: 0;
            /* 添加过渡效果 */
            transition: opacity 0.15s ease-out;
          }

           /* 悬停时显示操作按钮区域 */
          .CategoryHeader:hover .CategoryHeader__actions {
             opacity: 1;
          }

          .CategoryHeader__actionButton {
            padding: 3px;
            background: none;
            border: none;
            color: ${theme.textTertiary};
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: background-color 0.2s ease-out, color 0.2s ease-out;
            /* 透明度由父级 .CategoryHeader__actions 控制 */
          }

          .CategoryHeader__actionButton:hover {
            background-color: ${theme.backgroundSecondary};
          }

          /* 特定按钮的悬停颜色 */
          .CategoryHeader__actionButton--add:hover {
            color: ${theme.success};
          }
          .CategoryHeader__actionButton--edit:hover {
            color: ${theme.primary};
          }
          .CategoryHeader__actionButton--delete:hover {
            color: ${theme.error};
          }


          /* 模态框关闭按钮样式 */
          .CategoryHeader__modalCloseButton {
            background: none;
            border: none;
            color: ${theme.textSecondary};
            cursor: pointer;
            padding: 0;
            display: flex;
            align-items: center;
          }
           .CategoryHeader__modalCloseButton:hover {
               color: ${theme.text};
           }

          /* 模态框输入框样式 */
          .CategoryHeader__editInput {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid ${theme.border};
            border-radius: 6px;
            background: ${theme.background};
            color: ${theme.text};
            outline: none;
            font-size: 14px;
            box-sizing: border-box;
          }

          .CategoryHeader__editInput:focus {
            border-color: ${theme.primary};
             box-shadow: 0 0 0 2px ${theme.primary}30;
          }
        `}
      </style>
    </>
  );
};

export default CategoryHeader;
