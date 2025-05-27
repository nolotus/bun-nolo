// 文件路径: create/space/components/CategoryHeader.tsx
import React, { useState, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { useTheme } from "app/theme";
import { ConfirmModal } from "web/ui/ConfirmModal";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ChevronDownIcon,
} from "@primer/octicons-react";
import {
  updateCategoryName,
  deleteCategory,
  selectCurrentSpaceId,
  toggleCategoryCollapse,
  selectCollapsedCategories,
} from "create/space/spaceSlice";
import { createPage } from "render/page/pageSlice";
import { useNavigate } from "react-router-dom";
import { useInlineEdit } from "render/web/ui/useInlineEdit";
import InlineEditInput from "render/web/ui/InlineEditInput";
import { UNCATEGORIZED_ID } from "create/space/constants";

interface CategoryHeaderProps {
  categoryId: string;
  categoryName: string;
  isDragOver?: boolean;
  handleProps?: {
    onDragStart: (e: React.DragEvent) => void;
    onDragEnd: (e: React.DragEvent) => void;
  };
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  categoryId,
  categoryName = "",
  isDragOver,
  handleProps,
}) => {
  // --- State ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // --- Hooks & Selectors ---
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const spaceId = useAppSelector(selectCurrentSpaceId);
  const navigate = useNavigate();
  const collapsedCategories = useAppSelector(selectCollapsedCategories);

  // --- Computed Values ---
  const isUncategorized = categoryId === UNCATEGORIZED_ID;
  const isCollapsed = collapsedCategories[categoryId] ?? false;
  const displayCategoryName =
    isUncategorized && !categoryName ? "未分类" : categoryName;

  // --- Handlers ---
  const handleSave = useCallback(
    (newName: string) => {
      if (spaceId && !isUncategorized) {
        dispatch(updateCategoryName({ spaceId, categoryId, name: newName }));
      }
    },
    [dispatch, spaceId, categoryId, isUncategorized]
  );

  const { isEditing, startEditing, inputRef, inputProps } = useInlineEdit({
    initialValue: displayCategoryName,
    onSave: handleSave,
    placeholder: "输入分类名称",
    ariaLabel: "编辑分类名称",
    disabled: isUncategorized,
  });

  const handleToggleCollapse = useCallback(() => {
    dispatch(toggleCategoryCollapse(categoryId));
  }, [dispatch, categoryId]);

  const handleDelete = useCallback(() => {
    if (spaceId && !isUncategorized) {
      dispatch(deleteCategory({ spaceId, categoryId }));
    }
    setIsDeleteModalOpen(false);
  }, [dispatch, spaceId, categoryId, isUncategorized]);

  const handleAddPage = useCallback(async () => {
    if (!spaceId) return;
    try {
      const resultAction = await dispatch(createPage({ categoryId }));
      const pageKey = resultAction.payload as string;
      if (pageKey) {
        navigate(`/${pageKey}?edit=true`);
      }
    } catch (error) {
      console.error("Failed to create page:", error);
    }
  }, [dispatch, spaceId, categoryId, navigate]);

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.setData("categoryId", categoryId);
      e.dataTransfer.setData("dragType", "category");
      e.dataTransfer.effectAllowed = "move";
      setIsDragging(true);
      handleProps?.onDragStart?.(e);
    },
    [categoryId, handleProps]
  );

  const handleDragEnd = useCallback(
    (e: React.DragEvent) => {
      setIsDragging(false);
      handleProps?.onDragEnd?.(e);
    },
    [handleProps]
  );

  // --- Dynamic Props ---
  const canEdit = !isUncategorized && !isEditing;
  const canDrag = canEdit && handleProps;

  const nameProps = useMemo(
    () =>
      canDrag
        ? {
            draggable: true,
            onDragStart: handleDragStart,
            onDragEnd: handleDragEnd,
          }
        : {},
    [canDrag, handleDragStart, handleDragEnd]
  );

  // --- Class Names ---
  const headerClass = [
    "CategoryHeader",
    isDragOver && "CategoryHeader--drag-over",
    isEditing && "CategoryHeader--editing",
    isDragging && "CategoryHeader--dragging",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div className={headerClass}>
        {/* 折叠按钮 */}
        <button
          className={`CategoryHeader__collapseButton ${isCollapsed ? "CategoryHeader__collapseButton--collapsed" : ""}`}
          onClick={handleToggleCollapse}
          title={isCollapsed ? "展开" : "折叠"}
          type="button"
        >
          <ChevronDownIcon size={16} />
        </button>

        {/* 名称显示/编辑 */}
        {isEditing ? (
          <InlineEditInput inputRef={inputRef} {...inputProps} />
        ) : (
          <span
            className={`CategoryHeader__name ${canDrag ? "CategoryHeader__name--draggable" : ""}`}
            {...nameProps}
            title={canDrag ? "拖拽调整顺序" : displayCategoryName}
            onDoubleClick={canEdit ? startEditing : undefined}
          >
            {displayCategoryName}
          </span>
        )}

        {/* 操作按钮 */}
        <div className="CategoryHeader__actions">
          <button
            className="CategoryHeader__actionButton CategoryHeader__actionButton--add"
            onClick={handleAddPage}
            title="新建页面"
            disabled={isEditing}
            type="button"
          >
            <PlusIcon size={14} />
          </button>

          {canEdit && (
            <>
              <button
                className="CategoryHeader__actionButton CategoryHeader__actionButton--edit"
                onClick={startEditing}
                title="编辑名称"
                type="button"
              >
                <PencilIcon size={14} />
              </button>
              <button
                className="CategoryHeader__actionButton CategoryHeader__actionButton--delete"
                onClick={() => setIsDeleteModalOpen(true)}
                title="删除分类"
                type="button"
              >
                <TrashIcon size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* 删除确认弹窗 */}
      {!isUncategorized && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="删除分类"
          message={`确定要删除分类 "${displayCategoryName}" 吗？该分类下的所有内容将被移至"未分类"。此操作无法撤销。`}
          confirmText="确认删除"
          cancelText="取消"
          type="error"
          showCancel
        />
      )}

      <style href="category-header" precedence="medium">{`
        .CategoryHeader {
          display: flex;
          align-items: center;
          gap: ${theme.space[2]};
          padding: ${theme.space[1]} ${theme.space[2]};
          border-radius: ${theme.space[2]};
          min-height: 36px;
          transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
          user-select: none;
          position: relative;
        }

        .CategoryHeader:hover:not(.CategoryHeader--editing) {
          background-color: ${theme.backgroundHover};
        }

        .CategoryHeader--drag-over {
          background-color: ${theme.primaryGhost || "rgba(22, 119, 255, 0.08)"};
          border: 1px dashed ${theme.primary};
          transform: translateY(-1px);
        }

        .CategoryHeader--dragging {
          opacity: 0.8;
          background-color: ${theme.backgroundSelected};
          box-shadow: ${theme.shadowMedium};
          transform: translateY(-2px);
          z-index: 100;
        }

        .CategoryHeader__collapseButton {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          padding: 0;
          background: none;
          border: none;
          color: ${theme.textTertiary};
          cursor: pointer;
          border-radius: ${theme.space[1]};
          transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
          flex-shrink: 0;
        }

        .CategoryHeader__collapseButton:hover {
          color: ${theme.textSecondary};
          background-color: ${theme.backgroundTertiary};
        }

        .CategoryHeader__collapseButton--collapsed {
          transform: rotate(-90deg);
        }

        .CategoryHeader__name {
          flex: 1;
          font-size: 14px;
          font-weight: 600;
          color: ${theme.text};
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          min-width: 0;
          padding: ${theme.space[1]} 0;
          transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        .CategoryHeader__name--draggable {
          cursor: grab;
          padding-left: ${theme.space[1]};
          padding-right: ${theme.space[1]};
          margin: 0 -${theme.space[1]};
          border-radius: ${theme.space[1]};
          position: relative;
        }

        .CategoryHeader__name--draggable:hover {
          background-color: ${theme.backgroundTertiary};
        }

        .CategoryHeader__name--draggable:active {
          cursor: grabbing;
          transform: translateY(-1px);
        }

        .CategoryHeader__actions {
          display: flex;
          gap: 1px;
          align-items: center;
          opacity: 0;
          transition: opacity 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
          flex-shrink: 0;
        }

        .CategoryHeader:hover .CategoryHeader__actions:not(.CategoryHeader--editing .CategoryHeader__actions) {
          opacity: 1;
        }

        .CategoryHeader__actionButton {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          padding: 0;
          background: none;
          border: none;
          color: ${theme.textTertiary};
          cursor: pointer;
          border-radius: ${theme.space[1]};
          transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        .CategoryHeader__actionButton:hover:not(:disabled) {
          background-color: ${theme.backgroundTertiary};
        }

        .CategoryHeader__actionButton--add:hover:not(:disabled) {
          color: ${theme.success || "#52c41a"};
        }

        .CategoryHeader__actionButton--edit:hover {
          color: ${theme.primary};
        }

        .CategoryHeader__actionButton--delete:hover {
          color: ${theme.error || "#ff4d4f"};
        }

        .CategoryHeader__actionButton:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* 响应式优化 */
        @media (max-width: 768px) {
          .CategoryHeader {
            gap: ${theme.space[1]};
            padding: ${theme.space[1]};
          }
          
          .CategoryHeader__name {
            font-size: 13px;
          }
        }
      `}</style>
    </>
  );
};

export default React.memo(CategoryHeader);
