import React from "react"; // 引入 React
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
import { DraggableSyntheticListeners } from "@dnd-kit/core";
import { useNavigate } from "react-router-dom";
import { useInlineEdit } from "render/web/ui/useInlineEdit"; // Import the hook
import InlineEditInput from "render/web/ui/InlineEditInput"; // Import the input component

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
  // --- State ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  // Editing state is now managed by useInlineEdit hook

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

  // --- Inline Edit Hook ---
  // Define the save handler logic
  const handleSaveCategoryName = React.useCallback(
    (newName: string) => {
      const trimmedName = newName.trim(); // Already trimmed in hook, but double-check is safe

      // Check if name is valid and actually changed (hook handles basic validation)
      // The hook ensures onSave is only called if trimmedName is non-empty and different
      if (spaceId && !isUncategorized) {
        if (onEdit) {
          onEdit(categoryId, trimmedName);
        } else {
          dispatch(
            updateCategoryName({
              spaceId,
              categoryId,
              name: trimmedName,
            })
          );
        }
      }
    },
    [spaceId, categoryId, onEdit, dispatch, isUncategorized]
  );

  // Use the hook to manage editing state and input props
  const {
    isEditing,
    startEditing,
    inputRef,
    inputProps, // Contains value, onChange, onKeyDown, onBlur etc.
  } = useInlineEdit({
    initialValue: categoryName,
    onSave: handleSaveCategoryName,
    placeholder: "输入分类名称",
    ariaLabel: "编辑分类名称",
  });

  // --- Other Handlers ---
  const handleToggleCollapse = React.useCallback(() => {
    if (categoryId) {
      dispatch(toggleCategoryCollapse(categoryId));
    }
  }, [dispatch, categoryId]);

  // Trigger delete confirmation modal
  const handleDeleteClick = () => {
    if (!isUncategorized) {
      setIsDeleteModalOpen(true);
    }
  };

  // Confirm deletion
  const handleConfirmDelete = () => {
    if (spaceId && categoryId && !isUncategorized) {
      if (onDelete) {
        onDelete(categoryId);
      } else {
        dispatch(deleteCategory({ spaceId, categoryId }));
      }
    }
    setIsDeleteModalOpen(false);
  };

  // Add a new page
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

  // --- Dynamic ClassNames & Props ---
  // Add 'CategoryHeader--editing' class when editing
  const headerClassName = `CategoryHeader ${isDragOver ? "CategoryHeader--drag-over" : ""} ${isEditing ? "CategoryHeader--editing" : ""}`;
  const collapseButtonClassName = `CategoryHeader__collapseButton ${isCollapsed ? "CategoryHeader__collapseButton--collapsed" : ""}`;
  // Apply draggable class and props only when NOT editing
  const nameClassName = `CategoryHeader__name ${!isUncategorized && !isEditing ? "CategoryHeader__name--draggable" : ""}`;
  // Apply drag handle props only when not editing and not uncategorized
  const nameProps =
    !isUncategorized && !isEditing && handleProps ? handleProps : {};

  return (
    <>
      <div className={headerClassName}>
        {/* Collapse/Expand Button */}
        <span
          className={collapseButtonClassName}
          onClick={handleToggleCollapse}
          title={isCollapsed ? "展开分类" : "折叠分类"}
        >
          <ChevronDownIcon size={18} />
        </span>

        {/* Category Name (Span or InlineEditInput) */}
        {isEditing && !isUncategorized ? (
          <InlineEditInput
            inputRef={inputRef}
            {...inputProps} // Pass all necessary props from the hook
          />
        ) : (
          <span
            className={nameClassName}
            {...nameProps} // Apply drag listeners only when not editing
            title={
              !isUncategorized && !isEditing
                ? "拖拽以调整分类顺序"
                : categoryName
            }
            onDoubleClick={!isUncategorized ? startEditing : undefined} // Use startEditing from hook
          >
            {categoryName}
          </span>
        )}

        {/* Action Buttons Area */}
        <div className="CategoryHeader__actions">
          {/* Add Page Button */}
          <button
            className="CategoryHeader__actionButton CategoryHeader__actionButton--add"
            onClick={handleAddPage}
            title="在此分类下新建页面"
            disabled={isEditing} // Disable Add button while editing name
          >
            <PlusIcon size={14} />
          </button>

          {/* Edit and Delete Buttons (Not for Uncategorized and hide Edit when editing) */}
          {!isUncategorized &&
            !isEditing && ( // Hide Edit button itself when editing
              <>
                <button
                  className="CategoryHeader__actionButton CategoryHeader__actionButton--edit"
                  onClick={startEditing} // Use startEditing from hook
                  title="编辑分类名称"
                >
                  <PencilIcon size={14} />
                </button>
                <button
                  className="CategoryHeader__actionButton CategoryHeader__actionButton--delete"
                  onClick={handleDeleteClick}
                  title="删除分类"
                  disabled={isEditing} // Also disable delete while editing name
                >
                  <TrashIcon size={14} />
                </button>
              </>
            )}
          {/* No need for separate Save/Cancel icons here usually, handled by Input component's blur/Enter/Escape */}
        </div>
      </div>

      {/* Delete Confirmation Modal (Remains the same) */}
      {!isUncategorized && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="删除分类"
          message={`确定要删除分类 "${categoryName}" 吗？该分类下的所有内容将被移至“未分类”。此操作无法撤销。`}
          confirmText="确认删除"
          cancelText="取消"
          type="error"
          showCancel={true}
        />
      )}

      {/* CSS Styles (Removed inline input style) */}
      <style id="category-header-styles">
        {`
        /* --- Existing Styles (mostly unchanged) --- */
        .CategoryHeader {
          box-sizing: border-box;
          padding: 7px 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          border-radius: 8px;
          transition: background-color 0.15s ease;
          user-select: none;
          cursor: default;
          min-height: 36px;
          position: relative;
        }
        /* Add a subtle indicator when editing */
        .CategoryHeader--editing {
           /* Example: Optional background or border change */
           /* background-color: rgba(0, 0, 0, 0.02); */
        }

        .CategoryHeader:hover {
           /* Avoid hover background when editing to prevent input focus issues or visual clutter */
           background-color: ${isEditing ? "transparent" : theme?.backgroundHover || "rgba(0,0,0,0.03)"};
        }


        .CategoryHeader--drag-over { } /* Keep if needed */

        .CategoryHeader__collapseButton {
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${theme?.textTertiary || "#999"};
          cursor: pointer;
          border-radius: 6px;
          transition: transform 0.2s ease, color 0.2s ease, background-color 0.2s ease;
          flex-shrink: 0;
          padding: 3px;
          width: 24px;
          height: 24px;
          box-sizing: border-box;
        }

        .CategoryHeader__collapseButton:hover {
          color: ${theme?.textSecondary || "#666"};
          background-color: ${theme?.backgroundTertiary || "rgba(0,0,0,0.06)"};
        }

        .CategoryHeader__collapseButton--collapsed {
          transform: rotate(-90deg);
        }

        /* Category Name Span */
        .CategoryHeader__name {
          font-size: 14px;
          font-weight: 600;
          color: ${theme?.text || "#333"};
          flex-grow: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          min-width: 0;
          line-height: 1.4;
          letter-spacing: -0.01em;
          padding: 2px 0; /* Matches input vertical alignment better */
           height: 24px; /* Match input height for consistency */
           display: flex; /* Use flex to vertically center */
           align-items: center; /* Vertically center text */
           box-sizing: border-box;
        }

        .CategoryHeader__name--draggable {
          cursor: grab;
          position: relative;
          padding-left: 4px; /* Visual offset for grab area */
          margin-left: -4px; /* Compensate for padding */
          padding-right: 4px; /* Add padding for hover effect */
        }

        .CategoryHeader__name--draggable:active {
          cursor: grabbing;
        }

        /* Subtle hover background for draggable name */
        .CategoryHeader__name--draggable:hover::before {
           content: "";
           position: absolute;
           inset: -2px -4px; /* Cover padding */
           background-color: rgba(0, 0, 0, 0.03);
           border-radius: 4px;
           z-index: -1;
           pointer-events: none;
        }


        /* --- REMOVED .CategoryHeader__inlineInput styles --- */


        .CategoryHeader__actions {
          display: flex;
          gap: 2px;
          align-items: center;
          margin-left: auto; /* Pushes actions to the right */
          opacity: 0; /* Hidden by default */
          transition: opacity 0.15s ease;
          flex-shrink: 0; /* Prevent shrinking */
        }

        /* Show actions on hover ONLY when NOT editing */
        .CategoryHeader:hover .CategoryHeader__actions {
             opacity: ${isEditing ? 0 : 1};
        }

        /* Keep actions visible if the draggable parent indicates dragging (e.g., during dnd) */
        .CategoryDraggable--dragging .CategoryHeader__actions {
             opacity: 1;
        }


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
          /* Ensure buttons have consistent height */
          height: 24px;
          box-sizing: border-box;
        }

        /* Disable hover effects visually when editing */
        .CategoryHeader__actionButton:hover {
          background-color: ${isEditing ? "transparent" : theme?.backgroundTertiary || "rgba(0,0,0,0.06)"};
          color: ${isEditing ? theme?.textTertiary || "#999" : undefined}; /* Keep color same on hover when editing */
        }

        /* Specific icon color on hover (only when NOT editing) */
        .CategoryHeader__actionButton--add:hover {
            color: ${isEditing ? theme?.textTertiary || "#999" : theme?.success || "#52c41a"};
        }
        .CategoryHeader__actionButton--edit:hover {
             /* This button is hidden when editing, so no need for isEditing check */
             color: ${theme?.primary || "#1677ff"};
        }
        .CategoryHeader__actionButton--delete:hover {
             color: ${isEditing ? theme?.textTertiary || "#999" : theme?.error || "#ff4d4f"};
        }

        /* Disable pointer events and slightly fade disabled buttons */
         .CategoryHeader__actionButton:disabled {
             opacity: 0.5;
             cursor: not-allowed;
             background-color: transparent !important; /* Ensure no hover background */
             color: ${theme?.textTertiary || "#999"} !important; /* Ensure no hover color */
         }

      `}
      </style>
    </>
  );
};

export default React.memo(CategoryHeader); // Keep memoization
