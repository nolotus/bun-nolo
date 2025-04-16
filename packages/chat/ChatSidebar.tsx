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

import {
  DndContext,
  DragEndEvent,
  DraggableSyntheticListeners,
  // 可选：导入 PointerSensor, KeyboardSensor, useSensor, useSensors 以优化拖拽体验
  // PointerSensor,
  // KeyboardSensor,
  // useSensor,
  // useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
  // 可选：sortableKeyboardCoordinates 用于键盘支持
  // sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useGroupedContent } from "create/space/hooks/useGroupedContent"; // 确认路径

import CategorySection from "create/space/category/CategorySection"; // 确认路径 (导入合并后的组件)
import { UNCATEGORIZED_ID } from "create/space/constants"; // 确认路径 (导入常量)

// --- 类型定义 ---
// (假设 CategoryItem 类型定义保持不变)
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

// --- 可拖拽分类组件 ---
interface CategoryDraggableProps {
  id: string; // 分类 ID
  // 使用函数作为子元素，传递拖拽句柄
  children: (handleProps: DraggableSyntheticListeners) => React.ReactNode;
}

const CategoryDraggable: React.FC<CategoryDraggableProps> = ({
  id,
  children,
}) => {
  const {
    attributes,
    listeners, // 拖拽句柄
    setNodeRef,
    transform,
    transition,
    isDragging, // 是否正在拖拽
  } = useSortable({
    id, // Sortable ID
    data: { type: "CATEGORY" }, // 附加数据，标记类型为分类
  });

  // 应用 CSS 变换和过渡
  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    zIndex: isDragging ? 2 : 0, // 拖拽时提升层级
    position: isDragging ? ("relative" as const) : ("static" as const), // 确保 zIndex 生效
  };
  // 拖拽时的 CSS 类
  const draggingClass = isDragging ? "CategoryDraggable--dragging" : "";

  return (
    <div
      ref={setNodeRef} // 设置 Sortable 节点的 ref
      style={style}
      className={`CategoryDraggable ${draggingClass}`}
      {...attributes} // 应用 dnd-kit 属性 (例如 aria)
    >
      {/* 调用 children 函数，并将拖拽句柄 (listeners) 传递给它 */}
      {children(listeners)}
    </div>
  );
};

// --- 可拖拽内容项组件 ---
interface ItemDraggableProps {
  id: string; // 内容项 ID (通常是 contentKey)
  containerId: string; // 所属容器的 ID (分类 ID 或 UNCATEGORIZED_ID)
  animate?: boolean; // 是否应用动画
  // 使用函数作为子元素，传递拖拽句柄
  children: (handleProps: DraggableSyntheticListeners) => React.ReactNode;
}

export const ItemDraggable: React.FC<ItemDraggableProps> = ({
  id,
  containerId,
  animate,
  children,
}) => {
  const {
    attributes,
    listeners, // 拖拽句柄
    setNodeRef,
    transform,
    transition,
    isDragging, // 是否正在拖拽
  } = useSortable({
    id, // Sortable ID
    data: { type: "ITEM", containerId }, // 附加数据，标记类型和容器 ID
  });

  // 应用 CSS 变换和过渡，以及可能的入场动画
  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    animation: animate ? "itemFadeIn 0.3s ease-out" : "none",
  };
  // 拖拽时的 CSS 类
  const draggingClass = isDragging ? "ItemDraggable--dragging" : "";

  return (
    <div
      ref={setNodeRef} // 设置 Sortable 节点的 ref
      style={style}
      className={`ItemDraggable ${draggingClass}`}
      {...attributes} // 应用 dnd-kit 属性
    >
      {/* 调用 children 函数，并将拖拽句柄 (listeners) 传递给它 */}
      {children(listeners)}
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

  // 处理滚动事件 - 智能显示滚动条
  const handleScroll = useCallback(() => {
    if (!scrolling) {
      setScrolling(true);
      const timer = setTimeout(() => setScrolling(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [scrolling]);

  // 使用 useMemo 优化拖拽处理逻辑
  const handleDragEnd = useMemo(() => {
    return (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || !active.data.current || active.id === over.id) return;

      const activeId = active.id as string;
      const overId = over.id as string;
      const activeType = active.data.current.type as string;
      const overData = over.data.current;

      // 处理分类拖拽
      if (activeType === "CATEGORY") {
        const isOverCategory =
          overData?.type === "CATEGORY" ||
          sortedCategories.some((cat) => cat.id === overId);

        if (isOverCategory && overId !== UNCATEGORIZED_ID) {
          handleCategoryDragEnd(activeId, overId);
        }
      }
      // 处理项目拖拽
      else if (activeType === "ITEM") {
        const sourceContainer = active.data.current.containerId as string;
        let targetContainer: string | undefined;

        if (overData?.type === "CATEGORY_CONTAINER") {
          targetContainer = overData.containerId as string;
        } else if (overData?.type === "ITEM") {
          targetContainer = overData.containerId as string;
        } else if (overData?.type === "CATEGORY") {
          targetContainer = overId;
        }

        if (targetContainer && sourceContainer !== targetContainer) {
          handleItemDragEnd(activeId, sourceContainer, targetContainer);
        }
      }
    };
  }, [sortedCategories, handleCategoryDragEnd, handleItemDragEnd]);

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

  // 缓存分类 ID 列表
  const categoryIds = useMemo(
    () => sortedCategories.map((cat) => cat.id),
    [sortedCategories]
  );

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
    <DndContext onDragEnd={handleDragEnd}>
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
              <SortableContext
                items={categoryIds}
                strategy={verticalListSortingStrategy}
              >
                {groupedData.uncategorized.length > 0 && (
                  <CategorySection
                    key={UNCATEGORIZED_ID}
                    categoryId={UNCATEGORIZED_ID}
                    categoryName="未分类"
                    items={groupedData.uncategorized}
                    shouldAnimate={shouldAnimate}
                  />
                )}
                {sortedCategories.map((category) => (
                  <CategoryDraggable key={category.id} id={category.id}>
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
              </SortableContext>
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

          .CategoryDraggable--dragging {
            background-color: ${theme.backgroundHover || theme.backgroundSecondary || "#f5f5f5"};
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            opacity: 0.97;
            z-index: 5;
            transform: translateZ(0);
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
            opacity: 0.93;
            box-shadow: 0 1px 4px rgba(0,0,0,0.05), 0 2px 10px rgba(0,0,0,0.03);
            z-index: 5;
            transform: scale(1.01) translateZ(0); /* 轻微放大效果 */
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
    </DndContext>
  );
};

export default memo(ChatSidebar); // 使用 memo 优化性能
