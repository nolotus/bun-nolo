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
} from "@primer/octicons-react";
import {
  updateCategoryName,
  deleteCategory,
  selectCurrentSpaceId,
} from "create/space/spaceSlice";

interface CategoryHeaderProps {
  categoryId: string;
  categoryName: string;
  onEdit?: (categoryId: string, newName: string) => void;
  onDelete?: (categoryId: string) => void;
  isDragOver?: boolean;
  handleProps?: any;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  categoryId,
  categoryName,
  onEdit,
  onDelete,
  isDragOver,
  handleProps,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState(categoryName);

  const dispatch = useAppDispatch();
  const theme = useTheme();
  const spaceId = useAppSelector(selectCurrentSpaceId);

  const handleEdit = () => {
    setNewCategoryName(categoryName);
    setIsEditModalOpen(true);
  };

  const handleConfirmEdit = () => {
    if (newCategoryName && newCategoryName !== categoryName && spaceId) {
      if (onEdit) {
        onEdit(categoryId, newCategoryName);
      } else {
        dispatch(
          updateCategoryName({
            spaceId,
            categoryId,
            name: newCategoryName,
          })
        );
      }
    }
    setIsEditModalOpen(false);
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

  return (
    <>
      <div
        className={`category-header ${isDragOver ? "drag-over" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isHovered && (
          <span className="drag-handle" {...handleProps}>
            <GrabberIcon size={16} />
          </span>
        )}
        <span className="category-name">{categoryName}</span>
        {isHovered && (
          <div className="category-actions">
            <button
              className="action-button edit-button"
              onClick={handleEdit}
              title="编辑分类"
            >
              <PencilIcon size={14} />
            </button>
            <button
              className="action-button delete-button"
              onClick={handleDelete}
              title="删除分类"
            >
              <TrashIcon size={14} />
            </button>
          </div>
        )}
      </div>

      <BaseActionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="编辑分类名称"
        status="info"
        headerExtra={
          <button
            className="close-button"
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
              disabled={!newCategoryName || newCategoryName === categoryName}
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
          className="edit-input"
          placeholder="请输入新的分类名称"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleConfirmEdit();
          }}
        />
      </BaseActionModal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="删除分类"
        message={`确定要删除分类 "${categoryName}" 吗？`}
        confirmText="删除"
        cancelText="取消"
        type="error"
        showCancel={true}
      />

      <style>
        {`
          .category-header {
            margin: 2px 8px;
            padding: 6px 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-radius: 6px;
            background-color: transparent;
            border: 1px solid transparent;
            transition: all 0.2s ease-out;
            user-select: none;
            cursor: default;
          }

          .category-header:hover {
            background-color: ${theme.backgroundGhost};
            border-color: ${theme.borderLight}30;
          }

          .category-header.drag-over {
            background-color: ${theme.primaryGhost};
            border-color: ${theme.primary}30;
          }

          .drag-handle {
            cursor: grab;
            color: ${theme.textTertiary};
            display: flex;
            align-items: center;
            padding: 2px;
            border-radius: 4px;
          }

          .drag-handle:hover {
            color: ${theme.textSecondary};
            background-color: ${theme.backgroundGhost};
          }

          .category-name {
            font-size: 13px;
            font-weight: 500;
            color: ${theme.textSecondary};
            flex-grow: 1;
            margin-left: 4px;
          }

          .category-actions {
            display: flex;
            gap: 4px;
            align-items: center;
            opacity: 0;
            transition: opacity 0.2s ease-out;
          }

          .category-header:hover .category-actions {
            opacity: 1;
          }

          .action-button {
            padding: 2px;
            background: none;
            border: none;
            color: ${theme.textTertiary};
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: all 0.2s ease;
          }

          .action-button:hover {
            background-color: ${theme.backgroundGhost};
          }

          .edit-button:hover {
            color: ${theme.primary};
          }

          .delete-button:hover {
            color: ${theme.error};
          }

          .close-button {
            background: none;
            border: none;
            color: ${theme.textSecondary};
            cursor: pointer;
            padding: 0;
            display: flex;
            align-items: center;
          }

          .edit-input {
            width: 100%;
            padding: 8px;
            border: 1px solid ${theme.border};
            border-radius: 4px;
            background: ${theme.backgroundSecondary};
            color: ${theme.text};
            outline: none;
            font-size: 14px;
          }

          .edit-input:focus {
            border-color: ${theme.primary};
          }
        `}
      </style>
    </>
  );
};

export default CategoryHeader;
