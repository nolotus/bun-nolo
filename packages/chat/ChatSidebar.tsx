// 文件路径: chat/ChatSidebar.tsx
import React, {
  memo,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useAppDispatch, useAppSelector } from "app/hooks"; // 确认路径
import {
  selectCurrentSpace,
  updateContentCategory,
  reorderCategories,
} from "create/space/spaceSlice"; // 确认路径
import { SpaceData } from "create/space/types"; // 确认路径 (使用 SpaceData 或你定义的 Space 类型)
import { useTheme } from "app/theme"; // 确认路径
import { useGroupedContent } from "create/space/hooks/useGroupedContent"; // 确认路径
import CategorySection from "create/space/category/CategorySection"; // 确认路径 (导入合并后的组件)
import { UNCATEGORIZED_ID } from "create/space/constants"; // 确认路径 (导入常量)

// --- 类型定义 ---
interface CategoryItem {
  id: string;
  name: string;
  order?: number;
}

// --- 拖放相关 Hooks ---
/**
 * 处理分类拖拽排序的 Hook
 * @param sortedCategories - 当前排序的分类列表
 * @param space - 当前空间数据
 * @param dispatch - Redux dispatch 函数
 * @returns 拖拽结束时调用的回调函数
 */
const useCategoryDragAndDrop = (
  sortedCategories: CategoryItem[],
  space: SpaceData | null,
  dispatch: ReturnType<typeof useAppDispatch> // 使用具体的 Dispatch 类型
) => {
  return useCallback(
    (activeId: string, overId: string) => {
      // 检查 spaceId 是否存在，以及是否拖拽到自身
      if (!space?.id || activeId === overId) return;

      const oldIndex = sortedCategories.findIndex((cat) => cat.id === activeId);
      const newIndex = sortedCategories.findIndex((cat) => cat.id === overId);

      // 确保索引有效且发生变化
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        // 计算新的分类 ID 顺序
        const newOrder = arrayMove(
          sortedCategories.map((cat) => cat.id),
          oldIndex,
          newIndex
        );
        // 派发 action 更新分类顺序
        dispatch(
          reorderCategories({
            spaceId: space.id,
            sortedCategoryIds: newOrder,
          })
        );
      }
    },
    [dispatch, sortedCategories, space?.id] // 依赖项应包含 space.id
  );
};

// 临时实现 arrayMove 函数，因为我们移除了 @dnd-kit/sortable
const arrayMove = (array: any[], from: number, to: number) => {
  const newArray = [...array];
  const [removed] = newArray.splice(from, 1);
  newArray.splice(to, 0, removed);
  return newArray;
};

/**
 * 处理内容项在分类间拖拽移动的 Hook
 * @param space - 当前空间数据
 * @param dispatch - Redux dispatch 函数
 * @returns 拖拽结束时调用的回调函数
 */
const useItemDragAndDrop = (
  space: SpaceData | null,
  dispatch: ReturnType<typeof useAppDispatch> // 使用具体的 Dispatch 类型
) => {
  return useCallback(
    (itemId: string, sourceContainer: string, targetContainer: string) => {
      // 检查 spaceId 是否存在，以及容器是否相同
      if (!space?.id || sourceContainer === targetContainer) return;

      // 派发 action 更新内容的 categoryId
      dispatch(
        updateContentCategory({
          spaceId: space.id,
          contentKey: itemId,
          categoryId: targetContainer, // 直接使用目标容器 ID (可以是 UNCATEGORIZED_ID)
        })
      );
    },
    [dispatch, space?.id] // 依赖项应包含 space.id
  );
};

// --- 可拖拽分类容器组件 (仅用于处理内容项拖放和分类拖放的目标区域) ---
interface CategoryDraggableProps {
  id: string; // 分类 ID
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
      console.log("Dropped category:", sourceId, "onto:", id);
      if (sourceId && sourceId !== id) {
        onDropCategory(sourceId, id);
      }
    } else if (type === "item") {
      const itemId = e.dataTransfer.getData("itemId");
      const sourceContainer = e.dataTransfer.getData("sourceContainer");
      console.log(
        "Dropped item:",
        itemId,
        "from:",
        sourceContainer,
        "onto category:",
        id
      );
      if (itemId && sourceContainer !== id) {
        onDropItem(itemId, sourceContainer, id);
      }
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    // 空的函数，仅用于传递给 CategorySection 和 CategoryHeader
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // 空的函数，仅用于传递给 CategorySection 和 CategoryHeader
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`CategoryDraggable ${isDraggingOver ? `CategoryDraggable--drag-over${dragType ? `-${dragType}` : ""}` : ""}`}
      style={{ position: "relative" }}
    >
      {children({ onDragStart: handleDragStart, onDragEnd: handleDragEnd })}
    </div>
  );
};

// --- 可拖拽内容项组件 ---
interface ItemDraggableProps {
  id: string; // 内容项 ID (通常是 contentKey)
  containerId: string; // 所属容器的 ID (分类 ID 或 UNCATEGORIZED_ID)
  animate?: boolean; // 是否应用动画
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
    console.log("Drag started for item:", id, "in container:", containerId);
    e.dataTransfer.setData("itemId", id);
    e.dataTransfer.setData("sourceContainer", containerId);
    e.dataTransfer.setData("dragType", "item");
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    console.log("Drag ended for item:", id);
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
  id: string; // 分类 ID (UNCATEGORIZED_ID)
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
      console.log(
        "Dropped item:",
        itemId,
        "from:",
        sourceContainer,
        "onto uncategorized:",
        id
      );
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
      className={`UncategorizedDraggable ${isDraggingOver ? `UncategorizedDraggable--drag-over${dragType ? `-${dragType}` : ""}` : ""}`}
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

  // 处理分类拖放的回调
  const handleCategoryDrop = useCallback(
    (sourceId: string, targetId: string) => {
      console.log("Handling drop from", sourceId, "to", targetId);
      handleCategoryDragEnd(sourceId, targetId);
    },
    [handleCategoryDragEnd]
  );

  // 处理内容项拖放的回调
  const handleItemDrop = useCallback(
    (itemId: string, sourceContainer: string, targetContainer: string) => {
      console.log(
        "Handling item drop:",
        itemId,
        "from",
        sourceContainer,
        "to",
        targetContainer
      );
      handleItemDragEnd(itemId, sourceContainer, targetContainer);
    },
    [handleItemDragEnd]
  );

  // 处理滚动事件 - 智能显示滚动条
  const handleScroll = useCallback(() => {
    if (!scrolling) {
      setScrolling(true);
      const timer = setTimeout(() => setScrolling(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [scrolling]);

  // 设置滚动事件监听
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      scrollArea.addEventListener("scroll", handleScroll);
      return () => scrollArea.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  // 动画效果控制 - 延迟触发可见性动画
  useEffect(() => {
    const hasCategorizedContent = Object.values(groupedData.categorized).some(
      (list) => list.length > 0
    );
    const hasUncategorizedContent = groupedData.uncategorized.length > 0;

    if (hasCategorizedContent || hasUncategorizedContent) {
      const timer = setTimeout(() => {
        requestAnimationFrame(() => setShouldAnimate(true));
      }, 50); // 短暂延迟以提高动画效果
      return () => clearTimeout(timer);
    }
  }, [groupedData]);

  // 空状态检查
  const isEmpty = useMemo(() => {
    return (
      !Object.values(groupedData.categorized).some(
        (items) => items.length > 0
      ) && groupedData.uncategorized.length === 0
    );
  }, [groupedData]);

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
            <p>没有内容</p>
            <p className="ChatSidebar__empty-hint">创建内容时会在此显示</p>
          </div>
        ) : (
          <>
            {groupedData.uncategorized.length > 0 && (
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
            )}
            {sortedCategories.map((category) => (
              <CategoryDraggable
                key={category.id}
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
            ))}
          </>
        )}
      </div>

      <style>{`
        .ChatSidebar {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: ${theme.background};
          padding: 12px 4px;
          box-sizing: border-box;
          font-size: 0.925rem;
          user-select: none; 
          -webkit-tap-highlight-color: transparent;
        }

        .ChatSidebar__scroll-area {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 0 8px 12px;
          margin-right: -4px;
          scrollbar-width: thin; /* Firefox: 更细但可见的滚动条 */
          scrollbar-color: rgba(0,0,0,0.14) transparent; /* 适当可见度 */
          overscroll-behavior: contain;
          scroll-behavior: smooth;
          position: relative;
        }
        
        .ChatSidebar__scroll-area::-webkit-scrollbar {
          width: 2.5px; /* 调整到适当可见度 */
          background: transparent;
        }
        
        .ChatSidebar__scroll-area::-webkit-scrollbar-track {
          background: transparent;
          margin: 6px 0;
        }
        
        /* 可见但不突兀的滚动条 */
        .ChatSidebar__scroll-area::-webkit-scrollbar-thumb {
          background-color: rgba(0,0,0,0.14); /* 适当可见度 */
          border-radius: 4px;
          transition: background-color 0.3s ease;
        }
        
        .ChatSidebar__scroll-area:hover::-webkit-scrollbar-thumb {
          background-color: rgba(0,0,0,0.18);
        }
        
        .ChatSidebar__scroll-area::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0,0,0,0.24);
        }
        
        /* 暗色模式适配 */
        .ChatSidebar--dark .ChatSidebar__scroll-area::-webkit-scrollbar-thumb {
          background-color: rgba(255,255,255,0.14);
        }
        
        .ChatSidebar--dark .ChatSidebar__scroll-area:hover::-webkit-scrollbar-thumb {
          background-color: rgba(255,255,255,0.18);
        }
        
        .ChatSidebar--dark .ChatSidebar__scroll-area::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255,255,255,0.24);
        }

        /* 空状态样式 */
        .ChatSidebar__empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 20px;
          color: ${theme.textTertiary || "#888"};
          text-align: center;
          opacity: 0.75;
          animation: fadeIn 0.5s ease-out;
        }
        
        .ChatSidebar__empty-hint {
          font-size: 0.8rem;
          margin-top: 6px;
          opacity: 0.7;
          font-weight: 300;
        }

        /* 可拖拽分类容器样式 */
        .CategoryDraggable {
          border-radius: 8px;
          position: relative;
          background-color: transparent;
          transition: all 0.2s ease-out;
          margin-bottom: 5px;
          will-change: transform, opacity;
          backface-visibility: hidden; /* 减少重绘 */
          transform-style: preserve-3d; /* 更好的3D合成 */
          touch-action: pan-y; 
        }

        .CategoryDraggable:active {
          cursor: grabbing; /* 拖动时指针样式 */
        }

        .CategoryDraggable--drag-over-category {
          background-color: ${theme.primaryGhost || "rgba(22, 119, 255, 0.06)"};
          border: 1px dashed ${theme.primaryLight || "#91caff"};
        }

        .CategoryDraggable--drag-over-item {
          background-color: ${theme.successGhost || "rgba(82, 196, 26, 0.06)"};
          border: 1px dashed ${theme.successLight || "#b7eb8f"};
        }

        /* 未分类区域样式 */
        .UncategorizedDraggable {
          border-radius: 8px;
          position: relative;
          background-color: transparent;
          transition: all 0.2s ease-out;
          margin-bottom: 5px;
          will-change: transform, opacity;
          backface-visibility: hidden;
          transform-style: preserve-3d;
          touch-action: pan-y;
        }

        .UncategorizedDraggable--drag-over-item {
          background-color: ${theme.successGhost || "rgba(82, 196, 26, 0.06)"};
          border: 1px dashed ${theme.successLight || "#b7eb8f"};
        }

        /* 可拖拽项目容器样式 */
        .ItemDraggable {
          margin: 1.8px 0; 
          position: relative;
          border-radius: 6px;
          transition: all 0.2s ease-out;
          will-change: transform, opacity;
          backface-visibility: hidden;
        }

        .ItemDraggable:active {
          cursor: grabbing; /* 拖动时指针样式 */
        }

        .ItemDraggable--dragging {
          opacity: 0.7;
          background-color: ${theme.backgroundHover || "#f5f5f5"};
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }

        /* 精细的项目入场动画 */
        @keyframes itemFadeIn {
          0% {
            opacity: 0;
            transform: translateY(3px) scale(0.99);
          }
          45% {
            transform: translateY(1px) scale(0.995);
          }
          75% {
            opacity: 0.9;
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        /* 淡入动画 */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 0.75;
            transform: translateY(0);
          }
        }

        /* 拖动句柄和交互增强 */
        [data-draggable-handle] {
          cursor: grab; /* 提醒用户可拖动 */
        }
        
        [data-draggable-handle]:active {
          cursor: grabbing; /* 拖动中时指针 */
        }
        
        /* 响应式调整 */
        @media (max-width: 768px) {
          .ChatSidebar {
            font-size: 0.9rem; /* 移动设备更小字体 */
          }
          
          .ChatSidebar__scroll-area::-webkit-scrollbar {
            width: 2px; /* 移动设备更窄滚动条 */
          }
        }
        
        /* 高密度显示模式 */
        @media (min-resolution: 1.5dppx) {
          .CategoryDraggable {
            margin-bottom: 4px; /* 更密集布局 */
          }
          
          .ItemDraggable {
            margin: 1.5px 0; /* 更密集布局 */
          }
        }
        
        /* 低延迟拖动响应优化 - 减少动画干扰 */
        .ChatSidebar *:not(.ItemDraggable--dragging, .CategoryDraggable--dragging) {
          animation-duration: 0.2s !important; 
          animation-delay: 0s !important;
          transition-delay: 0s !important;
        }
      `}</style>
    </nav>
  );
};

export default memo(ChatSidebar); // 使用 memo 优化性能
