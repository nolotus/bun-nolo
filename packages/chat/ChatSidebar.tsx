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
} from "create/space/spaceSlice";
import { SpaceData } from "create/space/types";
import { useTheme } from "app/theme";
import { useGroupedContent } from "create/space/hooks/useGroupedContent";
import CategorySection from "create/space/category/CategorySection";
import { UNCATEGORIZED_ID } from "create/space/constants";

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

// --- 可拖拽分类容器组件 ---
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
      if (sourceId && sourceId !== id) {
        onDropCategory(sourceId, id);
      }
    } else if (type === "item") {
      const itemId = e.dataTransfer.getData("itemId");
      const sourceContainer = e.dataTransfer.getData("sourceContainer");
      if (itemId && sourceContainer !== id) {
        onDropItem(itemId, sourceContainer, id);
      }
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
      {children({
        onDragStart: () => {},
        onDragEnd: () => {},
      })}
    </div>
  );
};

// --- 可拖拽内容项组件 ---
interface ItemDraggableProps {
  id: string;
  containerId: string;
  animate?: boolean;
  children: (handleProps: {
    onDragStart: (e: React.DragEvent) => void;
    onDragEnd: (e: React.DragEvent) => void;
  }) => React.ReactNode;
}

export const ItemDraggable: React.FC<ItemDraggableProps> = ({
  id,
  containerId,
  animate,
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("itemId", id);
    e.dataTransfer.setData("sourceContainer", containerId);
    e.dataTransfer.setData("dragType", "item");
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`ItemDraggable ${isDragging ? "ItemDraggable--dragging" : ""}`}
      style={{
        margin: "1.8px 0",
        position: "relative",
        animation: animate ? "itemFadeIn 0.3s ease-out" : "none",
      }}
    >
      {children({ onDragStart: handleDragStart, onDragEnd: handleDragEnd })}
    </div>
  );
};

// --- 未分类区域的可拖拽组件 ---
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
      if (itemId && sourceContainer !== id) {
        onDropItem(itemId, sourceContainer, id);
      }
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const space = useAppSelector(selectCurrentSpace);
  const theme = useTheme();

  // 使用自定义 Hook 获取分组和排序后的数据
  const { groupedData, sortedCategories } = useGroupedContent(space);

  // 获取拖放处理函数
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

  // 处理滚动事件 - 智能显示滚动条
  const handleScroll = useCallback(() => {
    if (!scrolling) {
      setScrolling(true);
      const timer = setTimeout(() => setScrolling(false), 1200);
      return () => clearTimeout(timer);
    }
  }, [scrolling]);

  // 设置滚动事件监听
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      scrollArea.addEventListener("scroll", handleScroll, { passive: true });
      return () => scrollArea.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  // 优化的动画控制逻辑
  useEffect(() => {
    // 检查是否有任何可显示的内容（包括空分类）
    const hasContent = Object.values(groupedData.categorized).some(
      (list) => list.length > 0
    );
    const hasUncategorized = groupedData.uncategorized.length > 0;
    const hasCategories = sortedCategories.length > 0;

    if (hasContent || hasUncategorized || hasCategories) {
      // 使用 RAF 确保 DOM 更新完成后再触发动画
      const timer = setTimeout(
        () => {
          requestAnimationFrame(() => {
            setShouldAnimate(true);
            setIsInitialLoad(false);
          });
        },
        isInitialLoad ? 100 : 50
      ); // 初次加载稍长延迟
      return () => clearTimeout(timer);
    }
  }, [groupedData, sortedCategories, isInitialLoad]);

  // 修复空状态检查 - 考虑空分类的情况
  const isEmpty = useMemo(() => {
    const hasContent = Object.values(groupedData.categorized).some(
      (items) => items.length > 0
    );
    const hasUncategorized = groupedData.uncategorized.length > 0;
    const hasCategories = sortedCategories.length > 0;

    // 只有当既没有内容也没有分类时才是真正的空状态
    return !hasContent && !hasUncategorized && !hasCategories;
  }, [groupedData, sortedCategories]);

  // 获取当前主题是否为暗色
  const isDarkTheme = useMemo(() => {
    return (
      theme.type === "dark" ||
      window?.matchMedia?.("(prefers-color-scheme: dark)")?.matches
    );
  }, [theme.type]);

  return (
    <nav className={`ChatSidebar ${isDarkTheme ? "ChatSidebar--dark" : ""}`}>
      <div
        ref={scrollAreaRef}
        className={`ChatSidebar__scroll-area ${scrolling ? "is-scrolling" : ""}`}
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
            className={`ChatSidebar__content ${shouldAnimate ? "ChatSidebar__content--animate" : ""}`}
          >
            {/* 渲染未分类区域 */}
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

            {/* 渲染所有分类（包括空分类） */}
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
                      groupedData.uncategorized.length > 0 ? index + 1 : index,
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
          padding: ${theme.space[3]} ${theme.space[1]};
          box-sizing: border-box;
          font-size: 0.925rem;
          user-select: none; 
          -webkit-tap-highlight-color: transparent;
          position: relative;
        }

        .ChatSidebar__scroll-area {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 0 ${theme.space[2]} ${theme.space[3]};
          margin-right: -${theme.space[1]};
          scrollbar-width: thin;
          scrollbar-color: ${isDarkTheme ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"} transparent;
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
          background-color: ${isDarkTheme ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"};
          border-radius: 6px;
          transition: background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .ChatSidebar__scroll-area:hover::-webkit-scrollbar-thumb {
          background-color: ${isDarkTheme ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.18)"};
        }
        
        .ChatSidebar__scroll-area.is-scrolling::-webkit-scrollbar-thumb {
          background-color: ${isDarkTheme ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.25)"};
        }

        /* 内容容器 */
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

        /* 空状态样式优化 */
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

        /* 分类区域样式 */
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

        /* 空分类特殊样式 */
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

        /* 可拖拽分类容器样式优化 */
        .CategoryDraggable {
          border-radius: ${theme.space[2]};
          position: relative;
          background-color: transparent;
          transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
          margin-bottom: ${theme.space[1]};
          will-change: background-color, border, box-shadow, transform;
          backface-visibility: hidden;
          transform-style: preserve-3d;
          touch-action: pan-y; 
        }

        .CategoryDraggable:active {
          cursor: grabbing;
        }

        .CategoryDraggable--drag-over-category {
          background-color: ${
            isDarkTheme
              ? "rgba(22, 119, 255, 0.12)"
              : "rgba(22, 119, 255, 0.06)"
          };
          border: 1px dashed ${theme.primary};
          box-shadow: 0 0 0 1px ${
            isDarkTheme
              ? "rgba(135, 206, 255, 0.25)"
              : "rgba(22, 119, 255, 0.2)"
          };
          transform: translateY(-1px) scale(1.01);
        }

        .CategoryDraggable--drag-over-item {
          background-color: ${
            isDarkTheme ? "rgba(82, 196, 26, 0.12)" : "rgba(82, 196, 26, 0.06)"
          };
          border: 1px dashed ${theme.success || "#52c41a"};
          box-shadow: 0 0 0 1px ${
            isDarkTheme ? "rgba(176, 236, 129, 0.25)" : "rgba(82, 196, 26, 0.2)"
          };
          transform: translateY(-1px) scale(1.01);
        }

        /* 未分类区域样式 */
        .UncategorizedDraggable {
          border-radius: ${theme.space[2]};
          position: relative;
          background-color: transparent;
          transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
          margin-bottom: ${theme.space[1]};
          will-change: background-color, border, box-shadow, transform;
          backface-visibility: hidden;
          transform-style: preserve-3d;
          touch-action: pan-y;
        }

        .UncategorizedDraggable--drag-over-item {
          background-color: ${
            isDarkTheme ? "rgba(82, 196, 26, 0.12)" : "rgba(82, 196, 26, 0.06)"
          };
          border: 1px dashed ${theme.success || "#52c41a"};
          box-shadow: 0 0 0 1px ${
            isDarkTheme ? "rgba(176, 236, 129, 0.25)" : "rgba(82, 196, 26, 0.2)"
          };
          transform: translateY(-1px) scale(1.01);
        }

        /* 可拖拽项目容器样式优化 */
        .ItemDraggable {
          margin: 1.8px 0; 
          position: relative;
          border-radius: ${theme.space[2]};
          transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
          will-change: opacity, transform, background-color, box-shadow;
          backface-visibility: hidden;
        }

        .ItemDraggable:active {
          cursor: grabbing;
        }

        .ItemDraggable--dragging {
          opacity: 0.75;
          background-color: ${theme.backgroundHover};
          box-shadow: 0 4px 12px ${theme.shadowMedium};
          transform: translateY(-2px) scale(1.02);
          z-index: 100;
          border: 1px solid ${theme.borderHover};
        }

        /* 动画关键帧优化 */
        @keyframes itemFadeIn {
          0% {
            opacity: 0;
            transform: translateY(6px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes emptyStateIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 0.8;
            transform: translateY(0) scale(1);
          }
        }

        /* 拖动句柄优化 */
        [data-draggable-handle] {
          cursor: grab;
          transition: opacity 0.2s ease;
        }
        
        [data-draggable-handle]:hover {
          opacity: 0.8;
        }
        
        [data-draggable-handle]:active {
          cursor: grabbing;
          opacity: 1;
        }
        
        /* 响应式优化 */
        @media (max-width: 768px) {
          .ChatSidebar {
            font-size: 0.9rem;
            padding: ${theme.space[2]} ${theme.space[1]};
          }
          
          .ChatSidebar__scroll-area::-webkit-scrollbar {
            width: 2px;
          }
          
          .ChatSidebar__section {
            transition-delay: calc(var(--section-index, 0) * 0.05s);
          }
        }
        
        /* 高密度显示优化 */
        @media (min-resolution: 1.5dppx) {
          .CategoryDraggable {
            margin-bottom: ${theme.space[0]};
          }
          
          .ItemDraggable {
            margin: 1.5px 0;
          }
        }

        /* 减少动画的媒体查询 */
        @media (prefers-reduced-motion: reduce) {
          .ChatSidebar__content,
          .ChatSidebar__section,
          .CategoryDraggable,
          .UncategorizedDraggable,
          .ItemDraggable {
            transition-duration: 0.1s !important;
            animation-duration: 0.1s !important;
          }
          
          .ChatSidebar__empty-state {
            animation: none !important;
            opacity: 0.8 !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default memo(ChatSidebar);
