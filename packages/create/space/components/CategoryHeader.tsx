// 文件路径: create/space/components/CategoryHeader.tsx (假设)
import React from "react";
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
  updateCategoryName, // Assumed to be the thunk handling validation
  deleteCategory, // Assumed to be the thunk handling validation
  selectCurrentSpaceId,
  toggleCategoryCollapse,
  selectCollapsedCategories,
} from "create/space/spaceSlice";
import { createPage } from "render/page/pageSlice";
import { DraggableSyntheticListeners } from "@dnd-kit/core";
import { useNavigate } from "react-router-dom";
import { useInlineEdit } from "render/web/ui/useInlineEdit";
import InlineEditInput from "render/web/ui/InlineEditInput";

// Props interface remains simple
interface CategoryHeaderProps {
  categoryId: string;
  categoryName: string;
  isDragOver?: boolean;
  handleProps?: DraggableSyntheticListeners;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  categoryId,
  categoryName = "",
  isDragOver,
  handleProps,
}) => {
  // --- State ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  // --- Hooks ---
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const spaceId = useAppSelector(selectCurrentSpaceId);
  const navigate = useNavigate();

  // --- Selectors ---
  const collapsedCategories = useAppSelector(selectCollapsedCategories);
  const isCollapsed = collapsedCategories[categoryId] ?? false;

  // --- Computed ---
  const isUncategorized = categoryId === "uncategorized";

  // --- Inline Edit: Simplified Save Handler ---
  // This handler now *only* dispatches the action.
  // Validation (trimming, empty check, 'uncategorized', permissions) happens inside the updateCategoryName action.
  // The useInlineEdit hook ensures this is only called when the value has changed and potentially handles basic non-empty checks.
  const handleSaveDispatch = React.useCallback(
    (newName: string) => {
      if (spaceId && !isUncategorized) {
        // Keep basic guard for spaceId and 'uncategorized' before dispatching
        dispatch(updateCategoryName({ spaceId, categoryId, name: newName }));
      }
      // Note: updateCategoryName action should handle trimming internally now.
    },
    [dispatch, spaceId, categoryId, isUncategorized]
  );

  // Configure useInlineEdit to use the simple dispatch handler
  const { isEditing, startEditing, inputRef, inputProps } = useInlineEdit({
    initialValue: categoryName,
    onSave: handleSaveDispatch, // Use the simplified handler
    placeholder: "输入分类名称",
    ariaLabel: "编辑分类名称",
  });

  // --- Other Handlers (remain mostly the same) ---
  const handleToggleCollapse = React.useCallback(() => {
    if (categoryId) {
      dispatch(toggleCategoryCollapse(categoryId));
    }
  }, [dispatch, categoryId]);

  const handleDeleteClick = () => {
    if (!isUncategorized) {
      setIsDeleteModalOpen(true);
    }
  };

  // Uses deleteCategory action, which handles validation internally
  const handleConfirmDelete = () => {
    if (spaceId && !isUncategorized) {
      // Keep basic guard
      dispatch(deleteCategory({ spaceId, categoryId }));
    }
    setIsDeleteModalOpen(false);
  };

  // Add page handler remains the same
  const handleAddPage = async () => {
    if (!spaceId) return;
    try {
      const resultAction = await dispatch(createPage({ categoryId }));
      const dbKey = resultAction.payload as string;
      if (dbKey) {
        navigate(`/${dbKey}?edit=true`);
      }
    } catch (error) {
      console.error("Failed to create page:", error);
    }
  };

  // --- Dynamic ClassNames & Props (remain the same) ---
  const headerClassName = `CategoryHeader ${isDragOver ? "CategoryHeader--drag-over" : ""} ${isEditing ? "CategoryHeader--editing" : ""}`;
  const collapseButtonClassName = `CategoryHeader__collapseButton ${isCollapsed ? "CategoryHeader__collapseButton--collapsed" : ""}`;
  const nameClassName = `CategoryHeader__name ${!isUncategorized && !isEditing ? "CategoryHeader__name--draggable" : ""}`;
  const nameProps =
    !isUncategorized && !isEditing && handleProps ? handleProps : {};

  return (
    <>
      <div className={headerClassName}>
        {/* Collapse Button */}
        <span
          className={collapseButtonClassName}
          onClick={handleToggleCollapse}
          title={isCollapsed ? "展开分类" : "折叠分类"}
        >
          <ChevronDownIcon size={18} />
        </span>

        {/* Name Display / Edit Input */}
        {isEditing && !isUncategorized ? (
          <InlineEditInput inputRef={inputRef} {...inputProps} />
        ) : (
          <span
            className={nameClassName}
            {...nameProps}
            title={
              !isUncategorized && !isEditing
                ? "拖拽以调整分类顺序"
                : categoryName
            }
            onDoubleClick={!isUncategorized ? startEditing : undefined} // Allow editing normal categories
          >
            {categoryName}
          </span>
        )}

        {/* Action Buttons */}
        <div className="CategoryHeader__actions">
          {/* Add Page */}
          <button
            className="CategoryHeader__actionButton CategoryHeader__actionButton--add"
            onClick={handleAddPage}
            title="在此分类下新建页面"
            disabled={isEditing} // Disable while editing name
          >
            <PlusIcon size={14} />
          </button>

          {/* Edit/Delete (only for normal categories, hide edit button when editing) */}
          {!isUncategorized && !isEditing && (
            <>
              {/* Edit */}
              <button
                className="CategoryHeader__actionButton CategoryHeader__actionButton--edit"
                onClick={startEditing} // Trigger inline edit
                title="编辑分类名称"
              >
                <PencilIcon size={14} />
              </button>
              {/* Delete */}
              <button
                className="CategoryHeader__actionButton CategoryHeader__actionButton--delete"
                onClick={handleDeleteClick} // Open confirmation modal
                title="删除分类"
              >
                <TrashIcon size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {!isUncategorized && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete} // Dispatches deleteCategory action
          title="删除分类"
          message={`确定要删除分类 "${categoryName}" 吗？该分类下的所有内容将被移至“未分类”。此操作无法撤销。`}
          confirmText="确认删除"
          cancelText="取消"
          type="error"
          showCancel={true}
        />
      )}

      {/* CSS Styles (remain the same as previous version) */}
      <style id="category-header-styles">
        {`
        /* --- Styles from the previous version --- */
        .CategoryHeader {
          box-sizing: border-box; padding: 7px 10px; display: flex; align-items: center; gap: 8px; border-radius: 8px; transition: background-color 0.15s ease; user-select: none; cursor: default; min-height: 36px; position: relative;
        }
        .CategoryHeader--editing { }
        .CategoryHeader:hover {
           background-color: ${isEditing ? "transparent" : theme?.backgroundHover || "rgba(0,0,0,0.03)"};
        }
        .CategoryHeader--drag-over { }
        .CategoryHeader__collapseButton {
          display: flex; align-items: center; justify-content: center; color: ${theme?.textTertiary || "#999"}; cursor: pointer; border-radius: 6px; transition: transform 0.2s ease, color 0.2s ease, background-color 0.2s ease; flex-shrink: 0; padding: 3px; width: 24px; height: 24px; box-sizing: border-box;
        }
        .CategoryHeader__collapseButton:hover {
          color: ${theme?.textSecondary || "#666"}; background-color: ${theme?.backgroundTertiary || "rgba(0,0,0,0.06)"};
        }
        .CategoryHeader__collapseButton--collapsed {
          transform: rotate(-90deg);
        }
        .CategoryHeader__name {
          font-size: 14px; font-weight: 600; color: ${theme?.text || "#333"}; flex-grow: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; line-height: 1.4; letter-spacing: -0.01em; padding: 2px 0; height: 24px; display: flex; align-items: center; box-sizing: border-box;
        }
        .CategoryHeader__name--draggable {
          cursor: grab; position: relative; padding-left: 4px; margin-left: -4px; padding-right: 4px;
        }
        .CategoryHeader__name--draggable:active {
          cursor: grabbing;
        }
        .CategoryHeader__name--draggable:hover::before {
           content: ""; position: absolute; inset: -2px -4px; background-color: rgba(0, 0, 0, 0.03); border-radius: 4px; z-index: -1; pointer-events: none;
        }
        .CategoryHeader__actions {
          display: flex; gap: 2px; align-items: center; margin-left: auto; opacity: 0; transition: opacity 0.15s ease; flex-shrink: 0;
        }
        .CategoryHeader:hover .CategoryHeader__actions {
             opacity: ${isEditing ? 0 : 1};
        }
        .CategoryDraggable--dragging .CategoryHeader__actions {
             opacity: 1;
        }
        .CategoryHeader__actionButton {
          padding: 4px; background: none; border: none; color: ${theme?.textTertiary || "#999"}; cursor: pointer; display: flex; align-items: center; border-radius: 4px; transition: color 0.2s ease, background-color 0.2s ease; height: 24px; box-sizing: border-box;
        }
        .CategoryHeader__actionButton:hover {
          background-color: ${isEditing ? "transparent" : theme?.backgroundTertiary || "rgba(0,0,0,0.06)"};
          color: ${isEditing ? theme?.textTertiary || "#999" : undefined};
        }
        .CategoryHeader__actionButton--add:hover {
            color: ${isEditing ? theme?.textTertiary || "#999" : theme?.success || "#52c41a"};
        }
        .CategoryHeader__actionButton--edit:hover {
             color: ${theme?.primary || "#1677ff"};
        }
        .CategoryHeader__actionButton--delete:hover {
             color: ${isEditing ? theme?.textTertiary || "#999" : theme?.error || "#ff4d4f"};
        }
         .CategoryHeader__actionButton:disabled {
             opacity: 0.5; cursor: not-allowed; background-color: transparent !important; color: ${theme?.textTertiary || "#999"} !important;
         }
      `}
      </style>
    </>
  );
};

export default React.memo(CategoryHeader);
