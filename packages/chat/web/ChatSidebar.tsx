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
import { SpaceContent } from "app/types";
import { useGroupedContent } from "create/space/hooks/useGroupedContent";
import { UNCATEGORIZED_ID } from "create/space/constants";

import { useTranslation } from "react-i18next";

//web
import SidebarItem from "create/space/SidebarItem";
import ChatSidebarHeader from "./ChatSidebarHeader";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import CategoryHeader from "create/space/category/CategoryHeader";
import { AddCategoryModal } from "create/space/category/AddCategoryModal";
import { DraggableContainer } from "./DraggableContainer";
// --- 类型定义 ---
interface CategoryItem {
  id: string;
  name: string;
  order?: number;
}

interface CategorySectionProps {
  categoryId: string;
  categoryName: string;
  items: SpaceContent[];
  handleProps?: {
    onDragStart: (e: React.DragEvent) => void;
    onDragEnd: (e: React.DragEvent) => void;
  };
  isSelectionMode: boolean;
  selectedItems: Set<string>;
  onSelectItem: (contentKey: string) => void;
  onSelectCategory: (categoryId: string, select: boolean) => void;
  // --- 新增 Props ---
  activeMenuKey: string | null;
  onToggleMenu: (key: string | null) => void;
}

// --- 子组件: CategorySection ---
// CategorySection 现在需要传递 activeMenuKey 和 onToggleMenu
const CategorySection: React.FC<CategorySectionProps> = ({
  categoryId,
  categoryName,
  items = [],
  handleProps,
  isSelectionMode,
  selectedItems,
  onSelectItem,
  onSelectCategory,
  activeMenuKey,
  onToggleMenu,
}) => {
  const { t } = useTranslation("space");
  const collapsedCategories = useAppSelector(selectCollapsedCategories);
  const isCollapsed = collapsedCategories[categoryId] ?? false;

  const areAllItemsInCategorySelected =
    items.length > 0 &&
    items.every((item) => selectedItems.has(item.contentKey));

  const sectionClasses = [
    "CategorySection",
    categoryId === UNCATEGORIZED_ID && "CategorySection--uncategorized",
    items.length === 0 && "CategorySection--empty",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={sectionClasses}>
      <CategoryHeader
        categoryId={categoryId}
        categoryName={categoryName}
        handleProps={handleProps}
        isSelectionMode={isSelectionMode}
        isCategorySelected={areAllItemsInCategorySelected}
        onSelectCategory={() =>
          onSelectCategory(categoryId, !areAllItemsInCategorySelected)
        }
      />

      <div
        className={`CategorySection__content-wrapper ${
          isCollapsed && !isSelectionMode
            ? "CategorySection__content-wrapper--collapsed"
            : ""
        }`}
      >
        <div className="CategorySection__content-inner">
          {items.length > 0 ? (
            items.map((item, index) => (
              <SidebarItem
                key={item.contentKey}
                {...item}
                isSelectionMode={isSelectionMode}
                isSelected={selectedItems.has(item.contentKey)}
                onSelectItem={onSelectItem}
                style={{ "--item-index": index } as React.CSSProperties}
                // --- 传递状态和回调 ---
                isMenuOpen={activeMenuKey === item.contentKey}
                onToggleMenu={onToggleMenu}
              />
            ))
          ) : (
            <div className="CategorySection__empty-hint">
              <span>
                {isCollapsed && !isSelectionMode ? "" : t("dragToCategorize")}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
CategorySection.displayName = "CategorySection";

// --- 辅助 Hooks ---
const useCategoryDragAndDrop = (
  sortedCategories: CategoryItem[],
  spaceId: string | undefined,
  dispatch: ReturnType<typeof useAppDispatch>
) => {
  return useCallback(
    (activeId: string, overId: string) => {
      if (!spaceId || activeId === overId) return;
      const oldIndex = sortedCategories.findIndex((c) => c.id === activeId);
      const newIndex = sortedCategories.findIndex((c) => c.id === overId);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newArray = [...sortedCategories];
        const [movedItem] = newArray.splice(oldIndex, 1);
        newArray.splice(newIndex, 0, movedItem);
        dispatch(
          reorderCategories({
            spaceId,
            sortedCategoryIds: newArray.map((c) => c.id),
          })
        );
      }
    },
    [dispatch, sortedCategories, spaceId]
  );
};

const useItemDragAndDrop = (
  spaceId: string | undefined,
  dispatch: ReturnType<typeof useAppDispatch>
) => {
  return useCallback(
    (itemId: string, sourceContainer: string, targetContainer: string) => {
      if (!spaceId || sourceContainer === targetContainer) return;
      dispatch(
        updateContentCategory({
          spaceId,
          contentKey: itemId,
          categoryId: targetContainer,
        })
      );
    },
    [dispatch, spaceId]
  );
};

// --- 主侧边栏组件 ---
const ChatSidebar: React.FC = () => {
  const { t } = useTranslation("space");
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // ------------------- 变更点 1: 新增 State -------------------
  const [activeMenuKey, setActiveMenuKey] = useState<string | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const space = useAppSelector(selectCurrentSpace);

  const { groupedData, sortedCategories } = useGroupedContent(space);
  const collapsedCategories = useAppSelector(selectCollapsedCategories);

  const handleCategoryDragEnd = useCategoryDragAndDrop(
    sortedCategories,
    space?.id,
    dispatch
  );
  const handleItemDragEnd = useItemDragAndDrop(space?.id, dispatch);

  // ------------------- 变更点 2: 新增 Handler -------------------
  const handleToggleMenu = useCallback((key: string | null) => {
    // 如果传入的 key 和当前的 key 相同，则关闭菜单，否则打开新菜单
    setActiveMenuKey((prev) => (prev === key ? null : key));
  }, []);

  const allVisibleCategoryIds = useMemo(
    () => [
      ...sortedCategories.map((cat) => cat.id),
      ...(groupedData.uncategorized.length > 0 ? [UNCATEGORIZED_ID] : []),
    ],
    [sortedCategories, groupedData.uncategorized.length]
  );

  const areAllCollapsed = useMemo(
    () =>
      allVisibleCategoryIds.length > 0 &&
      allVisibleCategoryIds.every((id) => collapsedCategories[id]),
    [allVisibleCategoryIds, collapsedCategories]
  );

  const allContentKeys = useMemo(
    () => [
      ...groupedData.uncategorized.map((item) => item.contentKey),
      ...Object.values(groupedData.categorized)
        .flat()
        .map((item) => item.contentKey),
    ],
    [groupedData]
  );

  const areAllItemsSelected = useMemo(
    () =>
      allContentKeys.length > 0 && selectedItems.size === allContentKeys.length,
    [selectedItems.size, allContentKeys.length]
  );

  const isEmpty = useMemo(
    () => allContentKeys.length === 0 && sortedCategories.length === 0,
    [allContentKeys.length, sortedCategories.length]
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
        keysToUpdate.forEach((key) => {
          if (select) {
            newSet.add(key);
          } else {
            newSet.delete(key);
          }
        });
        return newSet;
      });
    },
    [groupedData]
  );

  const handleSelectAll = useCallback(() => {
    setSelectedItems((prev) => {
      if (prev.size === allContentKeys.length) {
        return new Set();
      } else {
        return new Set(allContentKeys);
      }
    });
  }, [allContentKeys]);

  const handleDeleteSelected = useCallback(() => {
    if (!space?.id || selectedItems.size === 0) return;
    dispatch(
      deleteMultipleContent({
        spaceId: space.id,
        contentKeys: Array.from(selectedItems),
      })
    );
    toast.success(t("itemsDeleted", { count: selectedItems.size }));
    setIsSelectionMode(false);
    setSelectedItems(new Set());
  }, [dispatch, space?.id, selectedItems, t]);

  const handleToggleAllCategories = useCallback(() => {
    if (space?.id && allVisibleCategoryIds.length > 0) {
      dispatch(setAllCategoriesCollapsed({ collapsed: !areAllCollapsed }));
    }
  }, [dispatch, space?.id, areAllCollapsed, allVisibleCategoryIds]);

  const handleAddCategory = (name: string) => {
    if (name.trim() && space?.id) {
      dispatch(addCategory({ spaceId: space.id, name: name.trim() }));
      toast.success(t("categoryCreated", { name }));
    }
    setIsAddCategoryModalOpen(false);
  };

  useEffect(() => {
    if (isEmpty) {
      setShouldAnimate(false);
      return;
    }
    const timer = setTimeout(() => {
      requestAnimationFrame(() => setShouldAnimate(true));
    }, 80);
    return () => clearTimeout(timer);
  }, [isEmpty]);

  // 滚动时关闭所有菜单，提升体验
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;
    const handleScroll = () => setActiveMenuKey(null);
    scrollArea.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollArea.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="ChatSidebar">
        <div className="ChatSidebar__header-wrapper">
          <ChatSidebarHeader
            isSelectionMode={isSelectionMode}
            selectedItemsCount={selectedItems.size}
            areAllItemsSelected={areAllItemsSelected}
            areAllCollapsed={areAllCollapsed}
            allVisibleCategoryIdsCount={allVisibleCategoryIds.length}
            onSelectAll={handleSelectAll}
            onDeleteSelected={handleDeleteSelected}
            onToggleSelectionMode={handleToggleSelectionMode}
            onAddCategory={() => setIsAddCategoryModalOpen(true)}
            onToggleAllCategories={handleToggleAllCategories}
          />
        </div>

        <div ref={scrollAreaRef} className="ChatSidebar__scroll-area">
          {!isEmpty && (
            <div
              className={`ChatSidebar__content ${
                shouldAnimate ? "ChatSidebar__content--animate" : ""
              }`}
            >
              {groupedData.uncategorized.length > 0 && (
                <div
                  className="ChatSidebar__section"
                  style={{ "--section-index": 0 } as React.CSSProperties}
                >
                  <DraggableContainer
                    id={UNCATEGORIZED_ID}
                    onDropItem={handleItemDragEnd}
                  >
                    {() => (
                      <CategorySection
                        categoryId={UNCATEGORIZED_ID}
                        categoryName={t("uncategorized")}
                        items={groupedData.uncategorized}
                        isSelectionMode={isSelectionMode}
                        selectedItems={selectedItems}
                        onSelectItem={handleSelectItem}
                        onSelectCategory={handleSelectCategory}
                        // --- 变更点 3: 传递 Props ---
                        activeMenuKey={activeMenuKey}
                        onToggleMenu={handleToggleMenu}
                      />
                    )}
                  </DraggableContainer>
                </div>
              )}

              {sortedCategories.map((category, index) => (
                <div
                  key={category.id}
                  className={`ChatSidebar__section ${
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
                  <DraggableContainer
                    id={category.id}
                    onDropCategory={handleCategoryDragEnd}
                    onDropItem={handleItemDragEnd}
                  >
                    {(handleProps) => (
                      <CategorySection
                        categoryId={category.id}
                        categoryName={category.name}
                        items={groupedData.categorized[category.id] || []}
                        handleProps={handleProps}
                        isSelectionMode={isSelectionMode}
                        selectedItems={selectedItems}
                        onSelectItem={handleSelectItem}
                        onSelectCategory={handleSelectCategory}
                        // --- 变更点 3: 传递 Props ---
                        activeMenuKey={activeMenuKey}
                        onToggleMenu={handleToggleMenu}
                      />
                    )}
                  </DraggableContainer>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onAddCategory={handleAddCategory}
      />

      <style href="ChatSidebar-styles" precedence="default">{`
        /* --- 将子组件的样式提取到这里 --- */
        .CategorySection {
          position: relative;
        }
        .CategorySection__content-wrapper {
          display: grid;
          grid-template-rows: 1fr;
          transition: grid-template-rows 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
          overflow: hidden;
        }
        .CategorySection__content-wrapper--collapsed {
          grid-template-rows: 0fr;
        }
        .CategorySection__content-inner {
          min-height: 0;
          padding-top: var(--space-1);
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .CategorySection__empty-hint {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 24px;
          margin: var(--space-1) 0;
          border: 1px dashed var(--border);
          border-radius: 4px;
          background: var(--backgroundGhost);
          color: var(--textQuaternary);
          font-size: 0.7rem;
          opacity: 0.6;
        }
        @media (prefers-reduced-motion: reduce) {
          .CategorySection__content-wrapper {
            transition-duration: 0.01s !important;
          }
        }
        /* --- ChatSidebar 自身样式 --- */
        .ChatSidebar {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--background);
          font-size: 0.875rem;
          user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        .ChatSidebar__header-wrapper {
          flex-shrink: 0;
        }
        .ChatSidebar__scroll-area {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: var(--space-1);
          scrollbar-width: thin;
          scrollbar-color: var(--textLight) transparent;
          overscroll-behavior: contain;
          scroll-behavior: smooth;
        }
        .ChatSidebar__scroll-area::-webkit-scrollbar { width: 3px; }
        .ChatSidebar__scroll-area::-webkit-scrollbar-track { background: transparent; margin: var(--space-2) 0; }
        .ChatSidebar__scroll-area::-webkit-scrollbar-thumb { background-color: var(--textLight); border-radius: 3px; transition: background-color 0.25s ease; }
        .ChatSidebar__scroll-area:hover::-webkit-scrollbar-thumb { background-color: var(--textSecondary); }
        .ChatSidebar__content {
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.4s cubic-bezier(0.25, 0.8, 0.25, 1),
                      transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .ChatSidebar__content--animate {
          opacity: 1;
          transform: translateY(0);
        }
        .ChatSidebar__section {
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.3s ease, transform 0.3s ease;
          transition-delay: calc(var(--section-index, 0) * 0.08s);
        }
        .ChatSidebar__content--animate .ChatSidebar__section {
          opacity: 1;
          transform: translateY(0);
        }
        .ChatSidebar__section--empty { opacity: 0.7; }
        .DraggableContainer {
          border-radius: 6px;
          transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .DraggableContainer--drag-over-category {
          background-color: var(--primaryGhost);
          border: 2px dashed var(--primary);
        }
        .DraggableContainer--drag-over-item {
          background-color: color-mix(in srgb, var(--success) 10%, transparent);
          border: 2px dashed var(--success);
        }
      `}</style>
    </>
  );
};

export default ChatSidebar;
