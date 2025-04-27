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
// --- 导入常量 ---
import { UNCATEGORIZED_ID } from "create/space/constants";

interface CategoryHeaderProps {
  categoryId: string; // 可以是真实的 ID 或 UNCATEGORIZED_ID
  categoryName: string;
  isDragOver?: boolean;
  handleProps?: {
    onDragStart: (e: React.DragEvent) => void;
    onDragEnd: (e: React.DragEvent) => void;
  };
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  categoryId,
  categoryName = "", // 默认值可能需要根据 UNCATEGORIZED_ID 调整显示名称
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
  // 使用 categoryId (可以是 UNCATEGORIZED_ID) 来检查折叠状态
  const isCollapsed = collapsedCategories[categoryId] ?? false;

  // --- Computed ---
  // 使用常量定义 isUncategorized
  const isUncategorized = categoryId === UNCATEGORIZED_ID;
  // 可以为未分类提供一个默认显示名称，如果 props 没有传入的话
  const displayCategoryName =
    isUncategorized && !categoryName ? "未分类" : categoryName;

  // --- Inline Edit: Save Handler ---
  // (保持不变，因为 UI 层会阻止对未分类项触发编辑)
  const handleSaveDispatch = React.useCallback(
    (newName: string) => {
      if (spaceId && categoryId !== UNCATEGORIZED_ID) {
        // 添加额外防护，虽然UI已阻止
        dispatch(updateCategoryName({ spaceId, categoryId, name: newName }));
      }
    },
    [dispatch, spaceId, categoryId]
  );

  const { isEditing, startEditing, inputRef, inputProps } = useInlineEdit({
    initialValue: displayCategoryName, // 使用处理后的显示名称
    onSave: handleSaveDispatch,
    placeholder: "输入分类名称",
    ariaLabel: "编辑分类名称",
    // 阻止对未分类项启动编辑
    disabled: isUncategorized,
  });

  // --- Other Handlers ---
  const handleToggleCollapse = React.useCallback(() => {
    // 移除 if(categoryId) 检查，允许所有 header (包括未分类) 触发折叠/展开
    // spaceSlice 中的 toggleCategoryCollapse 需要能正确处理 UNCATEGORIZED_ID
    dispatch(toggleCategoryCollapse(categoryId));
  }, [dispatch, categoryId]);

  // handleDeleteClick (保持不变，按钮已在 UI 中隐藏)
  const handleDeleteClick = () => {
    // 仅在非未分类时才打开模态框 (双重保险，UI已隐藏按钮)
    if (!isUncategorized) {
      setIsDeleteModalOpen(true);
    }
  };

  // handleConfirmDelete (保持不变，模态框已在 UI 中隐藏)
  const handleConfirmDelete = () => {
    // 仅在非未分类且 spaceId 存在时才执行删除 (双重保险)
    if (spaceId && !isUncategorized) {
      dispatch(deleteCategory({ spaceId, categoryId }));
    }
    setIsDeleteModalOpen(false);
  };

  // handleAddPage (保持不变，createPage slice 应能处理 categoryId === UNCATEGORIZED_ID)
  const handleAddPage = async () => {
    if (!spaceId) return;
    try {
      // 传递当前的 categoryId，即使是 UNCATEGORIZED_ID
      const resultAction = await dispatch(createPage({ categoryId }));
      // 假设 payload 是 contentKey 或 dbKey
      const pageKey = resultAction.payload as string;
      if (pageKey) {
        // 根据你的路由结构调整导航路径
        // 可能需要区分是 page 还是 dialog 等
        navigate(`/${pageKey}?edit=true`); // 示例导航
      }
    } catch (error) {
      console.error("Failed to create page:", error);
    }
  };

  // --- Dynamic ClassNames & Props ---
  // (保持不变，依赖 isUncategorized 和 isEditing)
  const headerClassName = `CategoryHeader ${isDragOver ? "CategoryHeader--drag-over" : ""} ${isEditing ? "CategoryHeader--editing" : ""}`;
  const collapseButtonClassName = `CategoryHeader__collapseButton ${isCollapsed ? "CategoryHeader__collapseButton--collapsed" : ""}`;
  const nameClassName = `CategoryHeader__name ${!isUncategorized && !isEditing ? "CategoryHeader__name--draggable" : ""}`;
  const nameProps =
    !isUncategorized && !isEditing && handleProps
      ? {
          draggable: true,
          onDragStart: handleProps.onDragStart,
          onDragEnd: handleProps.onDragEnd,
        }
      : {};

  // 自定义分类拖动开始事件
  const customDragStart = (e: React.DragEvent) => {
    console.log("Custom drag started for category:", categoryId);
    e.dataTransfer.setData("categoryId", categoryId);
    e.dataTransfer.setData("dragType", "category");
    e.dataTransfer.effectAllowed = "move";
    if (handleProps && handleProps.onDragStart) {
      handleProps.onDragStart(e);
    }
  };

  // 自定义分类拖动结束事件
  const customDragEnd = (e: React.DragEvent) => {
    console.log("Custom drag ended for category:", categoryId);
    if (handleProps && handleProps.onDragEnd) {
      handleProps.onDragEnd(e);
    }
  };

  return (
    <>
      <div className={headerClassName}>
        {/* Collapse Button */}
        <span
          className={collapseButtonClassName}
          onClick={handleToggleCollapse} // 允许所有头部折叠
          title={isCollapsed ? "展开" : "折叠"} // 简化 title
        >
          <ChevronDownIcon size={18} />
        </span>

        {/* Name Display / Edit Input */}
        {/* (逻辑保持不变，使用 isUncategorized 控制) */}
        {isEditing && !isUncategorized ? (
          <InlineEditInput inputRef={inputRef} {...inputProps} />
        ) : (
          <span
            className={nameClassName}
            {...nameProps}
            onDragStart={customDragStart}
            onDragEnd={customDragEnd}
            title={
              !isUncategorized && !isEditing
                ? "拖拽调整顺序" // 简化 title
                : displayCategoryName
            }
            onDoubleClick={!isUncategorized ? startEditing : undefined} // 阻止未分类项双击编辑
          >
            {displayCategoryName} {/* 使用处理后的显示名称 */}
          </span>
        )}

        {/* Action Buttons */}
        <div className="CategoryHeader__actions">
          {/* Add Page Button (始终显示，除非在编辑状态) */}
          <button
            className="CategoryHeader__actionButton CategoryHeader__actionButton--add"
            onClick={handleAddPage}
            title="新建页面" // 简化 title
            disabled={isEditing} // 仅在编辑时禁用
          >
            <PlusIcon size={14} />
          </button>

          {/* Edit/Delete Buttons (使用 isUncategorized 控制渲染) */}
          {!isUncategorized && !isEditing && (
            <>
              {/* Edit Button */}
              <button
                className="CategoryHeader__actionButton CategoryHeader__actionButton--edit"
                onClick={startEditing} // startEditing 已包含 isUncategorized 检查 (通过 useInlineEdit 的 disabled)
                title="编辑名称" // 简化 title
              >
                <PencilIcon size={14} />
              </button>
              {/* Delete Button */}
              <button
                className="CategoryHeader__actionButton CategoryHeader__actionButton--delete"
                onClick={handleDeleteClick} // 内部有检查，但按钮本身已条件渲染
                title="删除分类"
              >
                <TrashIcon size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal (使用 isUncategorized 控制渲染) */}
      {!isUncategorized && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete} // 内部有检查，但模态框本身已条件渲染
          title="删除分类"
          message={`确定要删除分类 "${displayCategoryName}" 吗？该分类下的所有内容将被移至“未分类”。此操作无法撤销。`}
          confirmText="确认删除"
          cancelText="取消"
          type="error"
          showCancel={true}
        />
      )}

      {/* CSS Styles (保持不变) */}
      <style id="category-header-styles">
        {`
        /* --- Styles from the previous version --- */
        .CategoryHeader { box-sizing: border-box; padding: 7px 10px; display: flex; align-items: center; gap: 8px; border-radius: 8px; transition: background-color 0.15s ease; user-select: none; cursor: default; min-height: 36px; position: relative; }
        .CategoryHeader--editing { }
        .CategoryHeader:hover { background-color: ${isEditing ? "transparent" : theme?.backgroundHover || "rgba(0,0,0,0.03)"}; }
        .CategoryHeader--drag-over { }
        .CategoryHeader__collapseButton { display: flex; align-items: center; justify-content: center; color: ${theme?.textTertiary || "#999"}; cursor: pointer; border-radius: 6px; transition: transform 0.2s ease, color 0.2s ease, background-color 0.2s ease; flex-shrink: 0; padding: 3px; width: 24px; height: 24px; box-sizing: border-box; }
        .CategoryHeader__collapseButton:hover { color: ${theme?.textSecondary || "#666"}; background-color: ${theme?.backgroundTertiary || "rgba(0,0,0,0.06)"}; }
        .CategoryHeader__collapseButton--collapsed { transform: rotate(-90deg); }
        .CategoryHeader__name { font-size: 14px; font-weight: 600; color: ${theme?.text || "#333"}; flex-grow: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; line-height: 1.4; letter-spacing: -0.01em; padding: 2px 0; height: 24px; display: flex; align-items: center; box-sizing: border-box; }
        .CategoryHeader__name--draggable { cursor: grab; position: relative; padding-left: 4px; margin-left: -4px; padding-right: 4px; }
        .CategoryHeader__name--draggable:active { cursor: grabbing; }
        .CategoryHeader__name--draggable:hover::before { content: ""; position: absolute; inset: -2px -4px; background-color: rgba(0, 0, 0, 0.03); border-radius: 4px; z-index: -1; pointer-events: none; }
        .CategoryHeader__actions { display: flex; gap: 2px; align-items: center; margin-left: auto; opacity: 0; transition: opacity 0.15s ease; flex-shrink: 0; }
        .CategoryHeader:hover .CategoryHeader__actions { opacity: ${isEditing ? 0 : 1}; }
        /* Ensure actions show when dragging */
        .CategoryHeader__name--draggable:active + .CategoryHeader__actions, /* When dragging the name */
        .CategoryHeader.CategoryHeader--drag-over .CategoryHeader__actions /* When hovering over with a draggable */ {
             opacity: 1;
        }
        .CategoryHeader__actionButton { padding: 4px; background: none; border: none; color: ${theme?.textTertiary || "#999"}; cursor: pointer; display: flex; align-items: center; border-radius: 4px; transition: color 0.2s ease, background-color 0.2s ease; height: 24px; box-sizing: border-box; }
        .CategoryHeader__actionButton:hover { background-color: ${isEditing ? "transparent" : theme?.backgroundTertiary || "rgba(0,0,0,0.06)"}; color: ${isEditing ? theme?.textTertiary || "#999" : undefined}; }
        .CategoryHeader__actionButton--add:hover { color: ${isEditing ? theme?.textTertiary || "#999" : theme?.success || "#52c41a"}; }
        .CategoryHeader__actionButton--edit:hover { color: ${theme?.primary || "#1677ff"}; }
        .CategoryHeader__actionButton--delete:hover { color: ${isEditing ? theme?.textTertiary || "#999" : theme?.error || "#ff4d4f"}; }
        .CategoryHeader__actionButton:disabled { opacity: 0.5; cursor: not-allowed; background-color: transparent !important; color: ${theme?.textTertiary || "#999"} !important; }
      `}
      </style>
    </>
  );
};

export default React.memo(CategoryHeader);
