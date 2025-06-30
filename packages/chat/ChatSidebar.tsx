import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useAppDispatch, useAppSelector } from "app/store";
import {
  selectCurrentSpace,
  updateContentCategory,
  reorderCategories,
  selectCollapsedCategories,
  setAllCategoriesCollapsed,
  addCategory,
  deleteMultipleContent,
} from "create/space/spaceSlice";
import { SpaceData } from "app/types";
import { useGroupedContent } from "create/space/hooks/useGroupedContent";
import { UNCATEGORIZED_ID } from "create/space/constants";

import { createPage } from "render/page/pageSlice";

import CategorySection from "create/space/category/CategorySection";
import { AddCategoryModal } from "create/space/category/AddCategoryModal";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  FoldDownIcon,
  FoldUpIcon,
  NoteIcon,
  FileDirectoryIcon,
  ChecklistIcon,
  TrashIcon,
  XIcon,
} from "@primer/octicons-react";

// --- 类型定义 ---
interface CategoryItem {
  id: string;
  name: string;
  order?: number;
}

// --- 拖放相关 Hooks ---
const useCategoryDragAndDrop = (
  sortedCategories: CategoryItem[],
  space: SpaceData | null,
  dispatch: ReturnType<typeof useAppDispatch>
) => {
  return useCallback(
    (activeId: string, overId: string) => {
      if (!space?.id || activeId === overId) return;
      const oldIndex = sortedCategories.findIndex((cat) => cat.id === activeId);
      const newIndex = sortedCategories.findIndex((cat) => cat.id === overId);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newOrder = arrayMove(
          sortedCategories.map((cat) => cat.id),
          oldIndex,
          newIndex
        );
        dispatch(
          reorderCategories({
            spaceId: space.id,
            sortedCategoryIds: newOrder,
          })
        );
      }
    },
    [dispatch, sortedCategories, space?.id]
  );
};

const arrayMove = (array: any[], from: number, to: number) => {
  const newArray = [...array];
  const [removed] = newArray.splice(from, 1);
  newArray.splice(to, 0, removed);
  return newArray;
};

const useItemDragAndDrop = (
  space: SpaceData | null,
  dispatch: ReturnType<typeof useAppDispatch>
) => {
  return useCallback(
    (itemId: string, sourceContainer: string, targetContainer: string) => {
      if (!space?.id || sourceContainer === targetContainer) return;
      dispatch(
        updateContentCategory({
          spaceId: space.id,
          contentKey: itemId,
          categoryId: targetContainer,
        })
      );
    },
    [dispatch, space?.id]
  );
};

// --- 可拖拽组件 ---
interface CategoryDraggableProps {
  id: string;
  children: (handleProps: {
    onDragStart: (e: React.DragEvent) => void;
    onDragEnd: (e: React.DragEvent) => void;
  }) => React.ReactNode;
  onDropCategory: (sourceId: string, targetId: string) => void;
  onDropItem: (
    itemId: string,
    sourceContainer: string,
    targetContainer: string
  ) => void;
}

const CategoryDraggable: React.FC<CategoryDraggableProps> = ({
  id,
  children,
  onDropCategory,
  onDropItem,
}) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [dragType, setDragType] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDraggingOver(true);
    setDragType(e.dataTransfer.getData("dragType"));
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    setDragType(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("dragType");
    setIsDraggingOver(false);
    setDragType(null);

    if (type === "category") {
      const sourceId = e.dataTransfer.getData("categoryId");
      if (sourceId && sourceId !== id) onDropCategory(sourceId, id);
    } else if (type === "item") {
      const itemId = e.dataTransfer.getData("itemId");
      const sourceContainer = e.dataTransfer.getData("sourceContainer");
      if (itemId && sourceContainer !== id)
        onDropItem(itemId, sourceContainer, id);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`CategoryDraggable ${
        isDraggingOver
          ? `CategoryDraggable--drag-over${dragType ? `-${dragType}` : ""}`
          : ""
      }`}
    >
      {children({ onDragStart: () => {}, onDragEnd: () => {} })}
    </div>
  );
};

interface UncategorizedDraggableProps {
  id: string;
  children: React.ReactNode;
  onDropItem: (
    itemId: string,
    sourceContainer: string,
    targetContainer: string
  ) => void;
}

const UncategorizedDraggable: React.FC<UncategorizedDraggableProps> = ({
  id,
  children,
  onDropItem,
}) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [dragType, setDragType] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDraggingOver(true);
    setDragType(e.dataTransfer.getData("dragType"));
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    setDragType(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("dragType");
    setIsDraggingOver(false);
    setDragType(null);

    if (type === "item") {
      const itemId = e.dataTransfer.getData("itemId");
      const sourceContainer = e.dataTransfer.getData("sourceContainer");
      if (itemId && sourceContainer !== id)
        onDropItem(itemId, sourceContainer, id);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`UncategorizedDraggable ${
        isDraggingOver
          ? `UncategorizedDraggable--drag-over${dragType ? `-${dragType}` : ""}`
          : ""
      }`}
    >
      {children}
    </div>
  );
};

// --- 主侧边栏组件 ---
const ChatSidebar: React.FC = () => {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const space = useAppSelector(selectCurrentSpace);

  const { groupedData, sortedCategories } = useGroupedContent(space);
  const collapsedCategories = useAppSelector(selectCollapsedCategories);

  const handleCategoryDragEnd = useCategoryDragAndDrop(
    sortedCategories,
    space,
    dispatch
  );
  const handleItemDragEnd = useItemDragAndDrop(space, dispatch);

  const allVisibleCategoryIds = useMemo(() => {
    const ids = sortedCategories.map((cat) => cat.id);
    if (groupedData.uncategorized.length > 0) ids.push(UNCATEGORIZED_ID);
    return ids;
  }, [sortedCategories, groupedData.uncategorized.length]);

  const areAllCollapsed = useMemo(() => {
    if (allVisibleCategoryIds.length === 0) return false;
    return allVisibleCategoryIds.every(
      (id) => collapsedCategories[id] === true
    );
  }, [allVisibleCategoryIds, collapsedCategories]);

  const allContentKeys = useMemo(() => {
    const keys = new Set<string>();
    groupedData.uncategorized.forEach((item) => keys.add(item.contentKey));
    Object.values(groupedData.categorized).forEach((items) => {
      items.forEach((item) => keys.add(item.contentKey));
    });
    return Array.from(keys);
  }, [groupedData]);

  const areAllItemsSelected = useMemo(
    () =>
      allContentKeys.length > 0 && selectedItems.size === allContentKeys.length,
    [selectedItems.size, allContentKeys.length]
  );

  const handleToggleSelectionMode = useCallback(() => {
    setIsSelectionMode((prev) => !prev);
    setSelectedItems(new Set());
  }, []);

  const handleSelectItem = useCallback((contentKey: string) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(contentKey)) {
        newSet.delete(contentKey);
      } else {
        newSet.add(contentKey);
      }
      return newSet;
    });
  }, []);

  const handleSelectCategory = useCallback(
    (categoryId: string, select: boolean) => {
      const itemsInCategory =
        categoryId === UNCATEGORIZED_ID
          ? groupedData.uncategorized
          : groupedData.categorized[categoryId] || [];
      const keysToUpdate = itemsInCategory.map((item) => item.contentKey);

      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        if (select) {
          keysToUpdate.forEach((key) => newSet.add(key));
        } else {
          keysToUpdate.forEach((key) => newSet.delete(key));
        }
        return newSet;
      });
    },
    [groupedData]
  );

  const handleSelectAll = useCallback(() => {
    if (areAllItemsSelected) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(allContentKeys));
    }
  }, [areAllItemsSelected, allContentKeys]);

  const handleDeleteSelected = useCallback(() => {
    if (!space?.id || selectedItems.size === 0) return;
    dispatch(
      deleteMultipleContent({
        spaceId: space.id,
        contentKeys: Array.from(selectedItems),
      })
    );
    toast.success(`成功删除 ${selectedItems.size} 个项目`);
    handleToggleSelectionMode();
  }, [dispatch, space?.id, selectedItems, handleToggleSelectionMode]);

  const handleToggleAllCategories = useCallback(() => {
    if (space?.id && allVisibleCategoryIds.length > 0) {
      dispatch(
        setAllCategoriesCollapsed({
          spaceId: space.id,
          collapsed: !areAllCollapsed,
        })
      );
    }
  }, [dispatch, space?.id, areAllCollapsed, allVisibleCategoryIds]);

  const handleNewPage = async () => {
    if (!space?.id) return;
    try {
      const key = await dispatch(createPage()).unwrap();
      navigate(`/${key}?edit=true`);
    } catch (error) {
      toast.error("创建页面失败");
    }
  };

  const handleAddCategory = (name: string) => {
    if (name.trim() && space?.id) {
      dispatch(addCategory({ spaceId: space.id, name: name.trim() }));
      toast.success(`分类 "${name}" 创建成功`);
    }
    setIsAddCategoryModalOpen(false);
  };

  const handleScroll = useCallback(() => {
    if (!scrolling) {
      setScrolling(true);
      const timer = setTimeout(() => setScrolling(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [scrolling]);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      scrollArea.addEventListener("scroll", handleScroll, { passive: true });
      return () => scrollArea.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    const hasContent = Object.values(groupedData.categorized).some(
      (list) => list.length > 0
    );
    const hasUncategorized = groupedData.uncategorized.length > 0;
    const hasCategories = sortedCategories.length > 0;

    if (hasContent || hasUncategorized || hasCategories) {
      const timer = setTimeout(
        () => {
          requestAnimationFrame(() => {
            setShouldAnimate(true);
            setIsInitialLoad(false);
          });
        },
        isInitialLoad ? 150 : 80
      );
      return () => clearTimeout(timer);
    }
  }, [groupedData, sortedCategories, isInitialLoad]);

  const isEmpty = useMemo(() => {
    const hasContent = Object.values(groupedData.categorized).some(
      (items) => items.length > 0
    );
    const hasUncategorized = groupedData.uncategorized.length > 0;
    const hasCategories = sortedCategories.length > 0;
    return !hasContent && !hasUncategorized && !hasCategories;
  }, [groupedData, sortedCategories]);

  return (
    <>
      <nav className="ChatSidebar">
        {!isEmpty && (
          <div className="ChatSidebar__header">
            {isSelectionMode ? (
              <>
                <h3 className="ChatSidebar__header-title">
                  {selectedItems.size} 项已选择
                </h3>
                <div className="ChatSidebar__header-actions">
                  <button
                    className="ChatSidebar__header-icon-btn"
                    onClick={handleSelectAll}
                    title={areAllItemsSelected ? "取消全选" : "全部选择"}
                    type="button"
                  >
                    <ChecklistIcon size={14} />
                  </button>
                  <button
                    className="ChatSidebar__header-icon-btn ChatSidebar__header-icon-btn--danger"
                    onClick={handleDeleteSelected}
                    title="删除所选"
                    disabled={selectedItems.size === 0}
                    type="button"
                  >
                    <TrashIcon size={14} />
                  </button>
                  <div className="ChatSidebar__header-divider"></div>
                  <button
                    className="ChatSidebar__header-icon-btn"
                    onClick={handleToggleSelectionMode}
                    title="取消选择模式"
                    type="button"
                  >
                    <XIcon size={16} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="ChatSidebar__header-title">内容</h3>
                <div className="ChatSidebar__header-actions">
                  <button
                    className="ChatSidebar__header-icon-btn"
                    onClick={handleNewPage}
                    title="新建页面"
                    type="button"
                  >
                    <NoteIcon size={14} />
                  </button>
                  <button
                    className="ChatSidebar__header-icon-btn"
                    onClick={() => setIsAddCategoryModalOpen(true)}
                    title="新建分类"
                    type="button"
                  >
                    <FileDirectoryIcon size={14} />
                  </button>
                  <button
                    className="ChatSidebar__header-icon-btn"
                    onClick={() => setIsSelectionMode(true)}
                    title="批量选择"
                    type="button"
                  >
                    <ChecklistIcon size={14} />
                  </button>
                  <div className="ChatSidebar__header-divider"></div>
                  <button
                    className="ChatSidebar__header-icon-btn"
                    onClick={handleToggleAllCategories}
                    title={areAllCollapsed ? "全部展开" : "全部折叠"}
                    disabled={allVisibleCategoryIds.length === 0}
                    type="button"
                  >
                    {areAllCollapsed ? (
                      <FoldUpIcon size={14} />
                    ) : (
                      <FoldDownIcon size={14} />
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        <div
          ref={scrollAreaRef}
          className={`ChatSidebar__scroll-area ${
            scrolling ? "is-scrolling" : ""
          }`}
        >
          {isEmpty ? (
            <div className="ChatSidebar__empty-state">
              <div className="ChatSidebar__empty-icon">📁</div>
              <h4 className="ChatSidebar__empty-title">暂无内容</h4>
              <p className="ChatSidebar__empty-hint">
                创建页面或分类时会在此显示
              </p>
              <button
                className="ChatSidebar__empty-action"
                onClick={handleNewPage}
                type="button"
              >
                <NoteIcon size={16} />
                <span>创建第一个页面</span>
              </button>
            </div>
          ) : (
            <div
              className={`ChatSidebar__content ${
                shouldAnimate ? "ChatSidebar__content--animate" : ""
              }`}
            >
              {groupedData.uncategorized.length > 0 && (
                <div
                  className="ChatSidebar__section ChatSidebar__section--uncategorized"
                  style={{ "--section-index": 0 } as React.CSSProperties}
                >
                  <UncategorizedDraggable
                    id={UNCATEGORIZED_ID}
                    onDropItem={handleItemDragEnd}
                  >
                    <CategorySection
                      key={UNCATEGORIZED_ID}
                      categoryId={UNCATEGORIZED_ID}
                      categoryName="未分类"
                      items={groupedData.uncategorized}
                      shouldAnimate={shouldAnimate}
                      isSelectionMode={isSelectionMode}
                      selectedItems={selectedItems}
                      onSelectItem={handleSelectItem}
                      onSelectCategory={handleSelectCategory}
                    />
                  </UncategorizedDraggable>
                </div>
              )}

              {sortedCategories.map((category, index) => (
                <div
                  key={category.id}
                  className={`ChatSidebar__section ChatSidebar__section--category ${
                    (groupedData.categorized[category.id] || []).length === 0
                      ? "ChatSidebar__section--empty"
                      : ""
                  }`}
                  style={
                    {
                      "--section-index":
                        groupedData.uncategorized.length > 0
                          ? index + 1
                          : index,
                    } as React.CSSProperties
                  }
                >
                  <CategoryDraggable
                    id={category.id}
                    onDropCategory={handleCategoryDragEnd}
                    onDropItem={handleItemDragEnd}
                  >
                    {(handleProps) => (
                      <CategorySection
                        categoryId={category.id}
                        categoryName={category.name}
                        items={groupedData.categorized[category.id] || []}
                        shouldAnimate={shouldAnimate}
                        handleProps={handleProps}
                        isSelectionMode={isSelectionMode}
                        selectedItems={selectedItems}
                        onSelectItem={handleSelectItem}
                        onSelectCategory={handleSelectCategory}
                      />
                    )}
                  </CategoryDraggable>
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>

      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onAddCategory={handleAddCategory}
      />

      <style href="ChatSidebar-styles" precedence="component">{`
        @keyframes emptyStateIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes buttonPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .ChatSidebar {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--background);
          padding: 0;
          box-sizing: border-box;
          font-size: 0.875rem;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
          position: relative;
        }

        .ChatSidebar__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-2);
          flex-shrink: 0;
          box-sizing: border-box;
          height: var(--headerHeight);
          border-bottom: 1px solid var(--border);
          background: var(--background);
        }

        .ChatSidebar__header-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--textTertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ChatSidebar__header-actions {
          display: flex;
          align-items: center;
          gap: var(--space-1);
        }

        .ChatSidebar__header-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          padding: 0;
          background: none;
          border: none;
          color: var(--textTertiary);
          cursor: pointer;
          border-radius: var(--space-1);
          transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
          position: relative;
          overflow: hidden;
          font-family: inherit;
        }

        .ChatSidebar__header-icon-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--backgroundHover);
          opacity: 0;
          transition: opacity 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
          border-radius: inherit;
        }

        .ChatSidebar__header-icon-btn:hover:not(:disabled)::before {
          opacity: 1;
        }

        .ChatSidebar__header-icon-btn:hover:not(:disabled) {
          color: var(--textSecondary);
          transform: translateY(-1px);
        }

        .ChatSidebar__header-icon-btn:active {
          transform: translateY(0);
          animation: buttonPulse 0.2s ease;
        }

        .ChatSidebar__header-icon-btn--danger::before {
          background: var(--error);
          opacity: 0;
        }

        .ChatSidebar__header-icon-btn--danger:hover:not(:disabled) {
          color: var(--error);
        }

        .ChatSidebar__header-icon-btn--danger:hover:not(:disabled)::before {
          opacity: 0.12;
        }

        .ChatSidebar__header-icon-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .ChatSidebar__header-icon-btn:disabled:hover {
          transform: none;
        }

        .ChatSidebar__header-divider {
          width: 1px;
          height: 14px;
          background-color: var(--border);
          margin: 0 var(--space-1);
          flex-shrink: 0;
        }

        .ChatSidebar__scroll-area {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: var(--space-2);
          scrollbar-width: thin;
          scrollbar-color: var(--textLight) transparent;
          overscroll-behavior: contain;
          scroll-behavior: smooth;
          position: relative;
          transition: scrollbar-color 0.3s ease;
        }

        .ChatSidebar__scroll-area::-webkit-scrollbar {
          width: 4px;
          background: transparent;
        }

        .ChatSidebar__scroll-area::-webkit-scrollbar-track {
          background: transparent;
          margin: var(--space-2) 0;
        }

        .ChatSidebar__scroll-area::-webkit-scrollbar-thumb {
          background-color: var(--textLight);
          border-radius: var(--space-2);
          transition: background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .ChatSidebar__scroll-area:hover::-webkit-scrollbar-thumb {
          background-color: var(--textTertiary);
        }

        .ChatSidebar__scroll-area.is-scrolling::-webkit-scrollbar-thumb {
          background-color: var(--textSecondary);
        }

        .ChatSidebar__content {
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.5s cubic-bezier(0.25, 0.8, 0.25, 1),
                      transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        .ChatSidebar__content--animate {
          opacity: 1;
          transform: translateY(0);
        }

        .ChatSidebar__empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: var(--space-8) var(--space-6);
          color: var(--textTertiary);
          text-align: center;
          opacity: 0;
          animation: emptyStateIn 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) 0.3s forwards;
        }

        .ChatSidebar__empty-icon {
          font-size: 3rem;
          margin-bottom: var(--space-4);
          opacity: 0.5;
          filter: grayscale(0.3);
        }

        .ChatSidebar__empty-title {
          margin: 0 0 var(--space-2) 0;
          font-weight: 500;
          font-size: 1rem;
          color: var(--textSecondary);
        }

        .ChatSidebar__empty-hint {
          font-size: 0.8rem;
          margin: 0 0 var(--space-4) 0;
          opacity: 0.7;
          font-weight: 300;
          line-height: 1.4;
        }

        .ChatSidebar__empty-action {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          background: var(--primaryGhost);
          color: var(--primary);
          border: none;
          border-radius: var(--space-2);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
          font-family: inherit;
        }

        .ChatSidebar__empty-action:hover {
          background: var(--primary);
          background: color-mix(in srgb, var(--primary) 12%, transparent);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px var(--shadowLight);
        }

        .ChatSidebar__section {
          margin-bottom: var(--space-2);
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.35s cubic-bezier(0.25, 0.8, 0.25, 1),
                      transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
          transition-delay: calc(var(--section-index, 0) * 0.1s);
        }

        .ChatSidebar__content--animate .ChatSidebar__section {
          opacity: 1;
          transform: translateY(0);
        }

        .ChatSidebar__section--empty {
          opacity: 0.7;
          position: relative;
        }

        .ChatSidebar__section--empty::after {
          content: "空分类";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 0.75rem;
          color: var(--textQuaternary);
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        .ChatSidebar__section--empty:hover::after {
          opacity: 0.8;
        }

        .CategoryDraggable,
        .UncategorizedDraggable {
          border-radius: var(--space-2);
          position: relative;
          background-color: transparent;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          margin-bottom: var(--space-1);
        }

        .CategoryDraggable--drag-over-category {
          background-color: var(--primaryGhost);
          border: 2px dashed var(--primary);
          transform: scale(1.02);
        }

        .CategoryDraggable--drag-over-item,
        .UncategorizedDraggable--drag-over-item {
          background-color: color-mix(in srgb, var(--success) 10%, transparent);
          border: 2px dashed var(--success);
          transform: scale(1.02);
        }

        /* 图标在按钮中的样式 */
        .ChatSidebar__header-icon-btn svg,
        .ChatSidebar__empty-action svg {
          position: relative;
          z-index: 1;
          flex-shrink: 0;
        }

        .ChatSidebar__empty-action span {
          position: relative;
          z-index: 1;
        }
      `}</style>
    </>
  );
};

export default ChatSidebar;
