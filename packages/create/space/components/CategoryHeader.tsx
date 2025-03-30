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
  PlusIcon,
  ChevronDownIcon,
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
  isDragOver?: boolean;
  handleProps?: DraggableSyntheticListeners;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  categoryId,
  categoryName = "",
  onEdit,
  onDelete,
  isDragOver,
  handleProps,
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState(categoryName);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false); // 新增：跟踪拖拽状态

  const dispatch = useAppDispatch();
  const theme = useTheme();
  const spaceId = useAppSelector(selectCurrentSpaceId);
  const navigate = useNavigate();

  const isUncategorized = categoryName === "未分类";

  // 监听拖拽状态变化
  const enhancedHandleProps = handleProps
    ? {
        ...handleProps,
        onDragStart: (e: any) => {
          setIsDragging(true);
          // 调用原始的onDragStart（如果存在）
          if (handleProps.onDragStart) handleProps.onDragStart(e);
        },
        onDragEnd: (e: any) => {
          setIsDragging(false);
          // 调用原始的onDragEnd（如果存在）
          if (handleProps.onDragEnd) handleProps.onDragEnd(e);
        },
      }
    : undefined;

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    // 折叠/展开分类的逻辑可在此处实现
  };

  const handleEdit = () => {
    setNewCategoryName(categoryName);
    setIsEditModalOpen(true);
  };

  const handleConfirmEdit = () => {
    if (
      newCategoryName?.trim() &&
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
    }
  };

  const handleDelete = () => setIsDeleteModalOpen(true);

  const handleConfirmDelete = () => {
    if (spaceId) {
      if (onDelete) {
        onDelete(categoryId);
      } else {
        dispatch(deleteCategory({ spaceId, categoryId }));
      }
    }
    setIsDeleteModalOpen(false);
  };

  const handleAddPage = async () => {
    if (!spaceId) return;
    try {
      const dbKey = await dispatch(createPage({ categoryId })).unwrap();
      navigate(`/${dbKey}?edit=true`);
    } catch (error) {
      console.error("Failed to create page:", error);
    }
  };

  // 构建类名
  const headerClassName = `CategoryHeader ${
    isDragOver ? "CategoryHeader--drag-over" : ""
  } ${isDragging ? "CategoryHeader--dragging" : ""} ${
    !isUncategorized ? "CategoryHeader--draggable" : ""
  }`;

  return (
    <>
      {/* 整个标题区域可拖拽（非未分类） */}
      <div
        className={headerClassName}
        {...(!isUncategorized ? enhancedHandleProps : {})}
        title={!isUncategorized ? "按住拖拽以调整分类顺序" : ""}
      >
        {/* 折叠按钮 - 独立事件处理，防止冒泡到拖拽 */}
        <span
          className={`CategoryHeader__collapseButton ${isCollapsed ? "CategoryHeader__collapseButton--collapsed" : ""}`}
          onClick={(e) => {
            e.stopPropagation(); // 阻止冒泡到拖拽
            toggleCollapse();
          }}
          title={isCollapsed ? "展开分类" : "折叠分类"}
        >
          <ChevronDownIcon size={18} />
        </span>

        {/* 分类名称 */}
        <span className="CategoryHeader__name">{categoryName}</span>

        {/* 操作按钮区域 */}
        <div className="CategoryHeader__actions">
          {/* 添加按钮 */}
          <button
            className="CategoryHeader__actionButton CategoryHeader__actionButton--add"
            onClick={(e) => {
              e.stopPropagation(); // 阻止冒泡到拖拽
              handleAddPage();
            }}
            title="新建页面"
          >
            <PlusIcon size={14} />
          </button>

          {/* 编辑和删除按钮 */}
          {!isUncategorized && (
            <>
              <button
                className="CategoryHeader__actionButton CategoryHeader__actionButton--edit"
                onClick={(e) => {
                  e.stopPropagation(); // 阻止冒泡到拖拽
                  handleEdit();
                }}
                title="编辑分类"
              >
                <PencilIcon size={14} />
              </button>
              <button
                className="CategoryHeader__actionButton CategoryHeader__actionButton--delete"
                onClick={(e) => {
                  e.stopPropagation(); // 阻止冒泡到拖拽
                  handleDelete();
                }}
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
              className="CategoryHeader__modalCloseButton"
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
                disabled={
                  !newCategoryName?.trim() ||
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
            value={newCategoryName || ""}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="CategoryHeader__editInput"
            placeholder="请输入新的分类名称"
            autoFocus
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                newCategoryName?.trim() &&
                newCategoryName.trim() !== categoryName
              ) {
                handleConfirmEdit();
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
          message={`确定要删除分类 "${categoryName}" 吗？该分类下的所有内容将被移至"未分类"。`}
          confirmText="删除"
          cancelText="取消"
          type="error"
          showCancel={true}
        />
      )}

      <style id="category-header">
        {`
        .CategoryHeader {
          box-sizing: border-box;
          padding: 7px 10px 7px 10px; /* 与SidebarItem一致的padding */
          display: flex;
          align-items: center;
          gap: 10px; /* 与SidebarItem一致的gap */
          border-radius: 8px;
          transition: all 0.15s ease;
          user-select: none;
          cursor: default;
          min-height: 36px;
          position: relative;
          margin: 8px 0 2px 0;
          background-color: transparent;
        }

        /* 可拖拽的标题样式 */
        .CategoryHeader--draggable {
          cursor: grab;
        }
        
        /* 拖拽时的视觉反馈 */
        .CategoryHeader--draggable:active {
          cursor: grabbing;
        }
        
        /* 拖拽进行中的样式 */
        .CategoryHeader--dragging {
          opacity: 0.8;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          background-color: ${theme?.backgroundSecondary || "#f5f5f7"};
          transform: scale(1.01);
        }

        .CategoryHeader:hover {
          background-color: ${theme?.backgroundHover || "rgba(0,0,0,0.03)"};
        }
        
        /* 在可拖拽区域悬停时添加轻微边框指示 */
        .CategoryHeader--draggable:hover::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          right: 0;
          bottom: 0;
          border-radius: 8px;
          border: 1px dashed ${theme?.border || "rgba(0,0,0,0.1)"};
          pointer-events: none;
          opacity: 0.5;
        }

        .CategoryHeader--drag-over {
          background-color: ${theme?.primaryGhost || "rgba(22, 119, 255, 0.06)"};
        }

        /* 折叠按钮样式，与SidebarItem的图标对齐 */
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
          width: auto;
          height: auto;
        }
        
        .CategoryHeader__collapseButton:hover {
          color: ${theme?.textSecondary || "#666"};
          background-color: ${theme?.backgroundTertiary || "#e8e8e8"};
        }
        
        .CategoryHeader__collapseButton--collapsed {
          transform: rotate(-90deg);
        }

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
        }

        .CategoryHeader__actions {
          position: absolute;
          right: 10px;
          display: flex;
          gap: 2px;
          align-items: center;
          opacity: 0;
          transition: opacity 0.15s ease;
          pointer-events: none;
          background: linear-gradient(90deg, transparent, ${theme?.backgroundHover || "rgba(0,0,0,0.03)"} 20%);
          padding-left: 20px;
          z-index: 2; /* 确保按钮在拖拽提示之上 */
        }

        .CategoryHeader:hover .CategoryHeader__actions {
          opacity: 1;
          pointer-events: all;
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
          background-color: ${theme?.backgroundTertiary || "#e8e8e8"};
        }

        .CategoryHeader__actionButton--add:hover {
          color: ${theme?.success || "#52c41a"};
        }
        .CategoryHeader__actionButton--edit:hover {
          color: ${theme?.primary || "#1677ff"};
        }
        .CategoryHeader__actionButton--delete:hover {
          color: ${theme?.error || "#ff4d4f"};
        }

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
        }

        .CategoryHeader__editInput:focus {
          border-color: ${theme?.primary || "#1677ff"};
          box-shadow: 0 0 0 2px ${theme?.primary ? `${theme.primary}30` : "rgba(22, 119, 255, 0.3)"};
        }
      `}
      </style>
    </>
  );
};

export default CategoryHeader;
