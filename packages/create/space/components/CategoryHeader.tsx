import React from "react"; // 引入 React
import { useAppDispatch, useAppSelector } from "app/hooks";
import { useTheme } from "app/theme";
import { ConfirmModal } from "web/ui/ConfirmModal";
// BaseActionModal is no longer needed for editing
import Button from "web/ui/Button"; // Keep for Delete Modal
import {
  XIcon, // Keep for Delete Modal or potentially inline cancel? (Let's remove for now)
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
  const [newCategoryName, setNewCategoryName] = React.useState(categoryName);
  const [isEditing, setIsEditing] = React.useState(false); // State for inline editing

  // --- Hooks ---
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const spaceId = useAppSelector(selectCurrentSpaceId);
  const navigate = useNavigate();
  const inputRef = React.useRef<HTMLInputElement>(null); // Ref for focusing input

  // --- Selectors ---
  const collapsedCategories = useAppSelector(selectCollapsedCategories);
  const isCollapsed = collapsedCategories[categoryId] ?? false;

  // --- Computed ---
  const isUncategorized = categoryId === "uncategorized";

  // --- Effects ---
  // Reset newCategoryName if categoryName prop changes externally while not editing
  React.useEffect(() => {
    if (!isEditing) {
      setNewCategoryName(categoryName);
    }
  }, [categoryName, isEditing]);

  // Focus input when editing starts
  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select(); // Select text for easy replacement
    }
  }, [isEditing]);

  // --- Handlers ---
  const handleToggleCollapse = React.useCallback(() => {
    if (categoryId) {
      dispatch(toggleCategoryCollapse(categoryId));
    }
  }, [dispatch, categoryId]);

  // Start inline editing
  const handleEditClick = () => {
    if (!isUncategorized) {
      setNewCategoryName(categoryName); // Ensure input starts with current name
      setIsEditing(true);
    }
  };

  // Save the edited name
  const handleSaveEdit = () => {
    const trimmedName = newCategoryName?.trim();

    // Check if name is valid and actually changed
    if (
      trimmedName &&
      trimmedName !== categoryName &&
      spaceId &&
      !isUncategorized
    ) {
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
    } else if (!trimmedName) {
      // Optional: Add feedback if name is empty
      console.warn("Category name cannot be empty.");
      // Revert to original name visually before cancelling
      setNewCategoryName(categoryName);
    }
    // Always exit editing mode after save attempt or if name is unchanged/invalid
    setIsEditing(false);
  };

  // Cancel inline editing
  const handleCancelEdit = () => {
    setNewCategoryName(categoryName); // Revert any changes
    setIsEditing(false);
  };

  // Handle keyboard events in input
  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent potential form submission
      handleSaveEdit();
    } else if (event.key === "Escape") {
      handleCancelEdit();
    }
  };

  // Handle input losing focus (blur)
  const handleInputBlur = () => {
    // Attempt to save changes on blur. handleSaveEdit handles validation & exits editing.
    handleSaveEdit();
  };

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
  const headerClassName = `CategoryHeader ${isDragOver ? "CategoryHeader--drag-over" : ""} ${isEditing ? "CategoryHeader--editing" : ""}`;
  const collapseButtonClassName = `CategoryHeader__collapseButton ${isCollapsed ? "CategoryHeader__collapseButton--collapsed" : ""}`;
  // Apply draggable class and props only when NOT editing
  const nameClassName = `CategoryHeader__name ${!isUncategorized && !isEditing ? "CategoryHeader__name--draggable" : ""}`;
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

        {/* Category Name (Conditional: Span or Input) */}
        {isEditing && !isUncategorized ? (
          <input
            ref={inputRef}
            type="text"
            value={newCategoryName || ""}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={handleInputKeyDown}
            onBlur={handleInputBlur}
            className="CategoryHeader__inlineInput"
            placeholder="输入分类名称"
            aria-label="编辑分类名称"
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
            onDoubleClick={!isUncategorized ? handleEditClick : undefined} // Optional: Double-click to edit
          >
            {categoryName}
          </span>
        )}

        {/* Action Buttons Area */}
        {/* Hide actions while editing for cleaner UI? Or show? Let's keep them visible */}
        <div className="CategoryHeader__actions">
          {/* Add Page Button */}
          <button
            className="CategoryHeader__actionButton CategoryHeader__actionButton--add"
            onClick={handleAddPage}
            title="在此分类下新建页面"
            // Disable add button while editing name? Optional.
            // disabled={isEditing}
          >
            <PlusIcon size={14} />
          </button>

          {/* Edit and Delete Buttons (Not for Uncategorized) */}
          {!isUncategorized &&
            !isEditing && ( // Hide Edit button itself when editing
              <>
                <button
                  className="CategoryHeader__actionButton CategoryHeader__actionButton--edit"
                  onClick={handleEditClick}
                  title="编辑分类名称"
                >
                  <PencilIcon size={14} />
                </button>
                <button
                  className="CategoryHeader__actionButton CategoryHeader__actionButton--delete"
                  onClick={handleDeleteClick}
                  title="删除分类"
                >
                  <TrashIcon size={14} />
                </button>
              </>
            )}
          {/* Optional: Show Save/Cancel icons during editing? */}
          {/* {isEditing && ( <> ... buttons ... </> )} */}
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

      {/* CSS Styles (Add style for inline input) */}
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
           /* background-color: ${theme?.backgroundSelected || "rgba(0, 120, 255, 0.08)"}; */ /* Optional subtle background */
        }

        .CategoryHeader:hover {
          /* Avoid hover effect when editing to prevent distraction */
          background-color: ${isEditing ? "transparent" : theme?.backgroundHover || "rgba(0,0,0,0.03)"};
        }

        .CategoryHeader--drag-over { }

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
          padding: 2px 0;
        }

        .CategoryHeader__name--draggable {
          cursor: grab;
          position: relative;
          padding-left: 4px;
          margin-left: -4px;
          padding-right: 4px;
        }

        .CategoryHeader__name--draggable:active {
          cursor: grabbing;
        }

        .CategoryHeader__name--draggable:hover::before {
          content: "";
          position: absolute;
          inset: -2px -4px;
          background-color: rgba(0, 0, 0, 0.03);
          border-radius: 4px;
          z-index: -1;
          pointer-events: none;
        }

        /* --- New Inline Input Style --- */
        .CategoryHeader__inlineInput {
          flex-grow: 1; /* Take available space like the span */
          font-size: 14px;
          font-weight: 600;
          color: ${theme?.text || "#333"};
          line-height: 1.4;
          letter-spacing: -0.01em;
          padding: 1px 4px; /* Adjust padding to match span visually */
          margin: 0; /* Remove default margin */
          border: 1px solid transparent; /* No border by default */
          background-color: transparent; /* Transparent background */
          outline: none;
          box-shadow: none;
          border-radius: 4px; /* Subtle rounding */
          min-width: 50px; /* Prevent collapsing too small */
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
          height: 24px; /* Match button height for alignment */
          box-sizing: border-box;
        }

        .CategoryHeader__inlineInput:focus {
          border-color: ${theme?.primary || "#1677ff"};
          background-color: ${theme?.background || "#fff"}; /* White background on focus */
          box-shadow: 0 0 0 2px ${theme?.primary ? `${theme.primary}33` : "rgba(22, 119, 255, 0.2)"};
        }
        /* --- End New Style --- */


        .CategoryHeader__actions {
          display: flex;
          gap: 2px;
          align-items: center;
          margin-left: auto;
          opacity: 0;
          transition: opacity 0.15s ease;
          flex-shrink: 0;
        }

        .CategoryHeader:hover .CategoryHeader__actions,
        .CategoryDraggable--dragging .CategoryHeader__actions {
            /* Don't show actions on hover when editing */
           opacity: ${isEditing ? 0 : 1};
        }
        /* Always show actions if the parent indicates dragging */
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
        }

        .CategoryHeader__actionButton:hover {
          /* Disable hover effect for buttons when editing? Optional */
          background-color: ${isEditing ? "transparent" : theme?.backgroundTertiary || "rgba(0,0,0,0.06)"};
          color: ${isEditing ? theme?.textTertiary || "#999" : undefined}; /* Prevent color change on hover when editing */
        }


        .CategoryHeader__actionButton--add:hover {
          color: ${isEditing ? theme?.textTertiary || "#999" : theme?.success || "#52c41a"};
        }
        .CategoryHeader__actionButton--edit:hover {
           color: ${isEditing ? theme?.textTertiary || "#999" : theme?.primary || "#1677ff"};
        }
        .CategoryHeader__actionButton--delete:hover {
           color: ${isEditing ? theme?.textTertiary || "#999" : theme?.error || "#ff4d4f"};
        }

        /* Remove modal specific styles */
        /* .CategoryHeader__modalCloseButton { ... } */
        /* .CategoryHeader__editInput { ... } */
      `}
      </style>
    </>
  );
};

export default React.memo(CategoryHeader);
