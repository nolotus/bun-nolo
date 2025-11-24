// CategoryHeader.tsx
import React, { useState, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "app/store";
import { ConfirmModal } from "render/web/ui/modal/ConfirmModal";
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
import { useTranslation } from "react-i18next";
import { useInlineEdit } from "render/web/ui/useInlineEdit";
import InlineEditInput from "render/web/ui/InlineEditInput";
import { UNCATEGORIZED_ID } from "create/space/constants";
import toast from "react-hot-toast";

interface CategoryHeaderProps {
  categoryId: string;
  categoryName: string;
  handleProps?: {
    onDragStart: (e: React.DragEvent) => void;
    onDragEnd: (e: React.DragEvent) => void;
  };
  isSelectionMode: boolean;
  isCategorySelected: boolean;
  onSelectCategory: () => void;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  categoryId,
  categoryName = "",
  handleProps,
  isSelectionMode,
  isCategorySelected,
  onSelectCategory,
}) => {
  const { t } = useTranslation("space");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const spaceId = useAppSelector(selectCurrentSpaceId);
  const collapsedCategories = useAppSelector(selectCollapsedCategories);

  const isUncategorized = categoryId === UNCATEGORIZED_ID;
  const isCollapsed = collapsedCategories[categoryId] ?? false;
  const displayCategoryName = isUncategorized
    ? t("uncategorized")
    : categoryName;

  const handleSaveName = useCallback(
    (newName: string) => {
      if (spaceId && !isUncategorized) {
        dispatch(updateCategoryName({ spaceId, categoryId, name: newName }));
      }
    },
    [dispatch, spaceId, categoryId, isUncategorized]
  );

  const { isEditing, startEditing, inputRef, inputProps } = useInlineEdit({
    initialValue: displayCategoryName,
    onSave: handleSaveName,
    placeholder: t("categoryNamePlaceholder"),
    disabled: isUncategorized,
  });

  const handleToggleCollapse = () =>
    dispatch(toggleCategoryCollapse({ categoryId }));

  const handleDelete = () => {
    if (spaceId && !isUncategorized) {
      dispatch(deleteCategory({ spaceId, categoryId }));
    }
    setIsDeleteModalOpen(false);
  };

  const handleAddPage = async () => {
    if (!spaceId) return;
    try {
      const pageKey = await dispatch(createPage({ categoryId })).unwrap();
      navigate(`/${pageKey}?edit=true`);
    } catch (error) {
      console.error("Failed to create page:", error);
      toast.error(t("createPageFailed"));
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData("categoryId", categoryId);
    e.dataTransfer.setData("dragType", "category");
    e.dataTransfer.effectAllowed = "move";
    handleProps?.onDragStart?.(e);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    handleProps?.onDragEnd?.(e);
  };

  const canEdit = !isUncategorized && !isEditing && !isSelectionMode;
  const canDrag = canEdit && !!handleProps;

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

  const headerClass = [
    "CategoryHeader",
    isEditing && "CategoryHeader--editing",
    isDragging && "CategoryHeader--dragging",
    isSelectionMode && "CategoryHeader--selection-mode",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div className={headerClass}>
        {isSelectionMode ? (
          <input
            type="checkbox"
            className="CategoryHeader__checkbox"
            checked={isCategorySelected}
            onChange={onSelectCategory}
            aria-label={t("selectCategory", { name: displayCategoryName })}
          />
        ) : (
          <button
            className={`CategoryHeader__collapse-btn ${isCollapsed ? "is-collapsed" : ""}`}
            onClick={handleToggleCollapse}
            title={isCollapsed ? t("expand") : t("collapse")}
            aria-expanded={!isCollapsed}
            type="button"
          >
            <ChevronDownIcon size={16} />
          </button>
        )}

        {isEditing ? (
          <InlineEditInput inputRef={inputRef} {...inputProps} />
        ) : (
          <span
            className={`CategoryHeader__name ${canDrag ? "is-draggable" : ""}`}
            {...nameProps}
            title={canDrag ? t("dragToReorder") : displayCategoryName}
            onDoubleClick={canEdit ? startEditing : undefined}
          >
            {displayCategoryName}
          </span>
        )}

        {canEdit && (
          <div className="CategoryHeader__actions">
            <button
              className="CategoryHeader__action-btn"
              onClick={handleAddPage}
              title={t("newPage")}
              type="button"
            >
              <PlusIcon size={14} />
            </button>
            <button
              className="CategoryHeader__action-btn"
              onClick={startEditing}
              title={t("editName")}
              type="button"
            >
              <PencilIcon size={14} />
            </button>
            <button
              className="CategoryHeader__action-btn is-danger"
              onClick={() => setIsDeleteModalOpen(true)}
              title={t("deleteCategory")}
              type="button"
            >
              <TrashIcon size={14} />
            </button>
          </div>
        )}
      </div>

      {!isUncategorized && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title={t("deleteCategory")}
          message={t("deleteCategoryConfirm", { name: displayCategoryName })}
          confirmText={t("common.confirmDelete")}
          cancelText={t("common.cancel")}
          type="error"
          showCancel
        />
      )}

      <style href="category-header-styles" precedence="medium">{`
        .CategoryHeader {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--space-2);
          min-height: 36px;
          transition: background-color 0.2s ease, box-shadow 0.2s ease;
          user-select: none;
        }
        .CategoryHeader:not(.CategoryHeader--selection-mode):hover:not(.CategoryHeader--editing) {
          background-color: var(--backgroundHover);
        }
        .CategoryHeader--dragging {
          opacity: 0.8;
          background-color: var(--backgroundSelected);
          box-shadow: var(--shadowMedium);
        }
        .CategoryHeader__collapse-btn, .CategoryHeader__action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          padding: 0;
          background: none;
          border: none;
          color: var(--textTertiary);
          cursor: pointer;
          border-radius: var(--space-1);
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .CategoryHeader__collapse-btn:hover, .CategoryHeader__action-btn:hover:not(:disabled) {
          color: var(--textSecondary);
          background-color: var(--backgroundTertiary);
        }
        .CategoryHeader__collapse-btn.is-collapsed {
          transform: rotate(-90deg);
        }
        .CategoryHeader__name {
          flex: 1;
          font-weight: 600;           /* 提升到 600，Windows 上更明显 */
          letter-spacing: 0.005em;    /* 轻微字距提升可读性 */
          color: var(--text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding: var(--space-1) 0;
        }
        .CategoryHeader__name.is-draggable { cursor: grab; }
        .CategoryHeader__name.is-draggable:active { cursor: grabbing; }
        .CategoryHeader__actions {
          display: flex;
          gap: 1px;
          align-items: center;
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .CategoryHeader:hover .CategoryHeader__actions {
          opacity: 1;
        }
        .CategoryHeader--editing .CategoryHeader__actions,
        .CategoryHeader--selection-mode .CategoryHeader__actions {
          opacity: 0;
          pointer-events: none;
        }
        .CategoryHeader__action-btn:hover.is-danger {
          color: var(--error);
        }
        .CategoryHeader__checkbox {
          width: 16px;
          height: 16px;
          margin: 4px;
          cursor: pointer;
        }
        @media (prefers-reduced-motion: reduce) {
          .CategoryHeader,
          .CategoryHeader__collapse-btn,
          .CategoryHeader__action-btn,
          .CategoryHeader__actions {
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default React.memo(CategoryHeader);
