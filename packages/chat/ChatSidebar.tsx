// 文件路径: chat/ChatSidebar.tsx
import React, {
  memo,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import {
  selectCurrentSpace,
  updateContentCategory,
  reorderCategories,
  selectCollapsedCategories,
  setAllCategoriesCollapsed,
  addCategory,
} from "create/space/spaceSlice";
import { SpaceData } from "create/space/types";
import { useTheme } from "app/theme";
import { useGroupedContent } from "create/space/hooks/useGroupedContent";
import CategorySection from "create/space/category/CategorySection";
import { UNCATEGORIZED_ID } from "create/space/constants";
import {
  FoldDownIcon,
  FoldUpIcon,
  NoteIcon, // <-- 更正: 使用 NoteIcon 代表页面
  FileDirectoryIcon, // <-- 更正: 使用 FileDirectoryIcon 代表分类
} from "@primer/octicons-react";
import { useNavigate } from "react-router-dom";
import { createPage } from "render/page/pageSlice";
import { AddCategoryModal } from "create/space/category/AddCategoryModal";

// --- 类型定义 (无变动) ---
interface CategoryItem {
  id: string;
  name: string;
  order?: number;
}

// --- 拖放相关 Hooks (无变动) ---
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

// --- 可拖拽组件 (无变动) ---
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
      style={{ position: "relative" }}
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
      style={{ position: "relative" }}
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const space = useAppSelector(selectCurrentSpace);
  const theme = useTheme();

  const { groupedData, sortedCategories } = useGroupedContent(space);
  const collapsedCategories = useAppSelector(selectCollapsedCategories);

  const handleCategoryDragEnd = useCategoryDragAndDrop(
    sortedCategories,
    space,
    dispatch
  );
  const handleItemDragEnd = useItemDragAndDrop(space, dispatch);
  const handleCategoryDrop = useCallback(
    (sourceId: string, targetId: string) => {
      handleCategoryDragEnd(sourceId, targetId);
    },
    [handleCategoryDragEnd]
  );
  const handleItemDrop = useCallback(
    (itemId: string, sourceContainer: string, targetContainer: string) => {
      handleItemDragEnd(itemId, sourceContainer, targetContainer);
    },
    [handleItemDragEnd]
  );
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

  const handleToggleAllCategories = useCallback(() => {
    if (space?.id && allVisibleCategoryIds.length > 0) {
      dispatch(
        setAllCategoriesCollapsed({
          spaceId: space.id,
          collapsed: !areAllCollapsed,
        })
      );
    }
  }, [dispatch, space?.id, areAllCollapsed, allVisibleCategoryIds.length]);

  const handleNewPage = async () => {
    if (!space?.id) return;
    const key = await dispatch(createPage()).unwrap();
    navigate(`/${key}?edit=true`);
  };

  const handleAddCategory = (name: string) => {
    if (name.trim() && space?.id) {
      dispatch(addCategory({ spaceId: space.id, name }));
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
        isInitialLoad ? 100 : 50
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
  const isDarkTheme = useMemo(() => {
    return (
      theme.type === "dark" ||
      window?.matchMedia?.("(prefers-color-scheme: dark)")?.matches
    );
  }, [theme.type]);

  return (
    <>
      <nav className={`ChatSidebar ${isDarkTheme ? "ChatSidebar--dark" : ""}`}>
        {!isEmpty && (
          <div className="ChatSidebar__header">
            <h3 className="ChatSidebar__header-title">内容</h3>
            <div className="ChatSidebar__header-actions">
              <button
                className="ChatSidebar__header-icon-btn"
                onClick={handleNewPage}
                title="新建页面"
              >
                <NoteIcon size={14} />
              </button>
              <button
                className="ChatSidebar__header-icon-btn"
                onClick={() => setIsAddCategoryModalOpen(true)}
                title="新建分类"
              >
                <FileDirectoryIcon size={14} />
              </button>
              <div className="ChatSidebar__header-divider"></div>
              <button
                className="ChatSidebar__header-icon-btn"
                onClick={handleToggleAllCategories}
                title={areAllCollapsed ? "全部展开" : "全部折叠"}
                disabled={allVisibleCategoryIds.length === 0}
              >
                {areAllCollapsed ? (
                  <FoldUpIcon size={14} />
                ) : (
                  <FoldDownIcon size={14} />
                )}
              </button>
            </div>
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
              <p>暂无内容</p>
              <p className="ChatSidebar__empty-hint">
                创建内容或分类时会在此显示
              </p>
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
                    onDropItem={handleItemDrop}
                  >
                    <CategorySection
                      key={UNCATEGORIZED_ID}
                      categoryId={UNCATEGORIZED_ID}
                      categoryName="未分类"
                      items={groupedData.uncategorized}
                      shouldAnimate={shouldAnimate}
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
                    onDropCategory={handleCategoryDrop}
                    onDropItem={handleItemDrop}
                  >
                    {(handleProps) => (
                      <CategorySection
                        categoryId={category.id}
                        categoryName={category.name}
                        items={groupedData.categorized[category.id] || []}
                        shouldAnimate={shouldAnimate}
                        handleProps={handleProps}
                      />
                    )}
                  </CategoryDraggable>
                </div>
              ))}
            </div>
          )}
        </div>

        <style>{`
        .ChatSidebar {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: ${theme.background};
          padding: 0 ${theme.space[1]} ${theme.space[3]};
          box-sizing: border-box;
          font-size: 0.925rem;
          user-select: none; 
          -webkit-tap-highlight-color: transparent;
          position: relative;
        }

        .ChatSidebar__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: ${theme.space[3]} ${theme.space[3]} ${theme.space[2]};
          flex-shrink: 0;
          box-sizing: border-box;
        }

        .ChatSidebar__header-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: ${theme.textTertiary};
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0;
        }

        .ChatSidebar__header-actions {
          display: flex;
          align-items: center;
          gap: ${theme.space[1]};
        }

        .ChatSidebar__header-icon-btn {
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

        .ChatSidebar__header-icon-btn:hover:not(:disabled) {
          color: ${theme.textSecondary};
          background-color: ${theme.backgroundTertiary};
        }

        .ChatSidebar__header-icon-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        
        .ChatSidebar__header-divider {
            width: 1px;
            height: 12px;
            background-color: ${theme.border};
            margin: 0 ${theme.space[1]};
        }

        .ChatSidebar__scroll-area {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 0 ${theme.space[2]} ${theme.space[3]};
          margin-right: -${theme.space[1]};
          scrollbar-width: thin;
          scrollbar-color: ${
            isDarkTheme ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"
          } transparent;
          overscroll-behavior: contain;
          scroll-behavior: smooth;
          position: relative;
          transition: scrollbar-color 0.3s ease;
        }
        
        .ChatSidebar__scroll-area::-webkit-scrollbar {
          width: 3px;
          background: transparent;
        }
        
        .ChatSidebar__scroll-area::-webkit-scrollbar-track {
          background: transparent;
          margin: ${theme.space[2]} 0;
        }
        
        .ChatSidebar__scroll-area::-webkit-scrollbar-thumb {
          background-color: ${
            isDarkTheme ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"
          };
          border-radius: 6px;
          transition: background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .ChatSidebar__scroll-area:hover::-webkit-scrollbar-thumb {
          background-color: ${
            isDarkTheme ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.18)"
          };
        }
        
        .ChatSidebar__scroll-area.is-scrolling::-webkit-scrollbar-thumb {
          background-color: ${
            isDarkTheme ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)"
          };
        }

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

        .ChatSidebar__empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: ${theme.space[6]};
          color: ${theme.textTertiary};
          text-align: center;
          opacity: 0;
          animation: emptyStateIn 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) 0.2s forwards;
        }

        .ChatSidebar__empty-icon {
          font-size: 2rem;
          margin-bottom: ${theme.space[3]};
          opacity: 0.5;
          filter: grayscale(0.3);
        }
        
        .ChatSidebar__empty-hint {
          font-size: 0.8rem;
          margin-top: ${theme.space[2]};
          opacity: 0.7;
          font-weight: 300;
          line-height: 1.4;
        }

        .ChatSidebar__section {
          margin-bottom: ${theme.space[1]};
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.3s cubic-bezier(0.25, 0.8, 0.25, 1),
                      transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          transition-delay: calc(var(--section-index, 0) * 0.08s);
        }

        .ChatSidebar__content--animate .ChatSidebar__section {
          opacity: 1;
          transform: translateY(0);
        }

        .ChatSidebar__section--empty {
          opacity: 0.8;
          position: relative;
        }

        .ChatSidebar__section--empty::after {
          content: "空分类";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 0.75rem;
          color: ${theme.textQuaternary};
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .ChatSidebar__section--empty:hover::after {
          opacity: 0.6;
        }

        .CategoryDraggable {
          border-radius: ${theme.space[2]};
          position: relative;
          background-color: transparent;
          transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
          margin-bottom: ${theme.space[1]};
        }

        .CategoryDraggable--drag-over-category {
          background-color: ${
            isDarkTheme
              ? "rgba(22, 119, 255, 0.12)"
              : "rgba(22, 119, 255, 0.06)"
          };
          border: 1px dashed ${theme.primary};
        }

        .CategoryDraggable--drag-over-item {
          background-color: ${
            isDarkTheme ? "rgba(82, 196, 26, 0.12)" : "rgba(82, 196, 26, 0.06)"
          };
          border: 1px dashed ${theme.success || "#52c41a"};
        }

        .UncategorizedDraggable {
          border-radius: ${theme.space[2]};
          position: relative;
          background-color: transparent;
          transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
          margin-bottom: ${theme.space[1]};
        }

        .UncategorizedDraggable--drag-over-item {
          background-color: ${
            isDarkTheme ? "rgba(82, 196, 26, 0.12)" : "rgba(82, 196, 26, 0.06)"
          };
          border: 1px dashed ${theme.success || "#52c41a"};
        }
      `}</style>
      </nav>
      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onAddCategory={handleAddCategory}
      />
    </>
  );
};

export default memo(ChatSidebar);
