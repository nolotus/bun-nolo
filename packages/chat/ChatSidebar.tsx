import React, { memo, useState, useEffect, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import {
  selectCurrentSpace,
  updateContentCategory,
  reorderCategories,
} from "create/space/spaceSlice";
import { SpaceContent, Space } from "create/space/types";
import CategoryHeader from "create/space/components/CategoryHeader";
import { useTheme } from "app/theme";
import { SidebarItem } from "./dialog/SidebarItem"; // 请确保路径正确

import { DndContext, DragEndEvent, useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useGroupedContent } from "./hooks/useGroupedContent"; // 请确保路径正确

import AddCategoryControl from "create/space/components/AddCategoryControl";

interface CategoryItem {
  id: string;
  name: string;
  order?: number;
}

// --- 拖放相关 Hooks ---
const useCategoryDragAndDrop = (
  sortedCategories: CategoryItem[],
  space: Space | null,
  dispatch: any
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
    [dispatch, sortedCategories, space]
  );
};

const useItemDragAndDrop = (space: Space | null, dispatch: any) => {
  return useCallback(
    (itemId: string, sourceContainer: string, targetContainer: string) => {
      if (!space?.id || sourceContainer === targetContainer) return;
      dispatch(
        updateContentCategory({
          spaceId: space.id,
          contentKey: itemId,
          categoryId:
            targetContainer === "uncategorized" ? "" : targetContainer,
        })
      );
    },
    [dispatch, space]
  );
};

// --- 可拖拽组件 ---
interface CategoryDraggableProps {
  id: string;
  children: React.ReactNode;
}

const CategoryDraggable: React.FC<CategoryDraggableProps> = ({
  id,
  children,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: { type: "CATEGORY" },
  });
  // dnd-kit 动态计算的样式
  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    zIndex: isDragging ? 2 : 0,
    position: isDragging ? ("relative" as const) : ("static" as const),
  };
  const draggingClass = isDragging ? "CategoryDraggable--dragging" : "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`CategoryDraggable ${draggingClass}`}
      {...attributes}
    >
      {/* 将拖拽监听器传递给子组件 (CategorySection -> CategoryHeader) */}
      {React.cloneElement(children as React.ReactElement, {
        handleProps: listeners,
      })}
    </div>
  );
};

interface ItemDraggableProps {
  id: string;
  containerId: string;
  animate?: boolean;
  children: React.ReactNode;
}

const ItemDraggable: React.FC<ItemDraggableProps> = ({
  id,
  containerId,
  animate,
  children,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: { type: "ITEM", containerId },
  });
  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    animation: animate ? "itemFadeIn 0.3s ease-out" : "none",
  };
  const draggingClass = isDragging ? "ItemDraggable--dragging" : "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`ItemDraggable ${draggingClass}`}
      {...attributes}
    >
      {/* 将拖拽监听器传递给子组件 (SidebarItem) */}
      {React.cloneElement(children as React.ReactElement, {
        handleProps: listeners,
      })}
    </div>
  );
};

// --- 分区组件 ---
interface CategorySectionProps {
  category: CategoryItem;
  items: SpaceContent[];
  shouldAnimate: boolean;
  // 从 CategoryDraggable 传递下来的拖拽监听器
  handleProps?: any;
}

const CategorySection: React.FC<CategorySectionProps> = memo(
  ({ category, items, shouldAnimate, handleProps }) => {
    const { isOver, setNodeRef } = useDroppable({
      id: category.id,
      data: { containerId: category.id, type: "CATEGORY_CONTAINER" },
    });
    const dragOverClass = isOver ? "ChatSidebar__category--drag-over" : "";
    return (
      <div
        ref={setNodeRef}
        className={`ChatSidebar__category ${dragOverClass}`}
      >
        <CategoryHeader
          categoryId={category.id}
          categoryName={category.name}
          // 将拖拽句柄传递给 Header
          handleProps={handleProps}
          isDragOver={isOver} // 将拖拽悬停状态传递给 Header 以应用样式
        />
        <div className="ChatSidebar__category-content">
          <SortableContext
            items={items.map((item) => item.contentKey)}
            strategy={verticalListSortingStrategy}
          >
            {items.map((item) => (
              <ItemDraggable
                key={item.contentKey}
                id={item.contentKey}
                containerId={category.id}
                animate={shouldAnimate}
              >
                {/* 将 handleProps 传递给 SidebarItem */}
                <SidebarItem {...item} />
              </ItemDraggable>
            ))}
          </SortableContext>
        </div>
      </div>
    );
  }
);

interface UncategorizedSectionProps {
  items: SpaceContent[];
  shouldAnimate: boolean;
}

const UncategorizedSection: React.FC<UncategorizedSectionProps> = memo(
  ({ items, shouldAnimate }) => {
    const { isOver, setNodeRef } = useDroppable({
      id: "uncategorized",
      data: { containerId: "uncategorized", type: "CATEGORY_CONTAINER" },
    });
    const dragOverClass = isOver ? "ChatSidebar__category--drag-over" : "";
    return (
      <div
        ref={setNodeRef}
        className={`ChatSidebar__category ChatSidebar__category--uncategorized ${dragOverClass}`}
      >
        <CategoryHeader
          categoryId="uncategorized"
          categoryName="未分类"
          isDragOver={isOver} // 将拖拽悬停状态传递给 Header
          // 未分类区域通常不需要拖拽手柄 (handleProps)
        />
        <div className="ChatSidebar__category-content">
          <SortableContext
            items={items.map((item) => item.contentKey)}
            strategy={verticalListSortingStrategy}
          >
            {items.map((item) => (
              <ItemDraggable
                key={item.contentKey}
                id={item.contentKey}
                containerId="uncategorized"
                animate={shouldAnimate}
              >
                {/* 将 handleProps 传递给 SidebarItem */}
                <SidebarItem {...item} />
              </ItemDraggable>
            ))}
          </SortableContext>
        </div>
      </div>
    );
  }
);

// --- 主侧边栏组件 ---
const ChatSidebar: React.FC = () => {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const dispatch = useAppDispatch();
  const space = useAppSelector(selectCurrentSpace);
  const theme = useTheme();

  const { groupedData, sortedCategories } = useGroupedContent(space);
  const handleCategoryDragEnd = useCategoryDragAndDrop(
    sortedCategories,
    space,
    dispatch
  );
  const handleItemDragEnd = useItemDragAndDrop(space, dispatch);

  // 处理所有拖放结束事件
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !active.data.current) {
      // console.warn("DragEnd event missing active or over data.");
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;
    const activeType = active.data.current.type;
    const overData = over.data.current;

    if (activeId === overId) return; // 没有移动

    if (activeType === "CATEGORY") {
      // 确保目标是另一个分类或其容器
      if (overData?.type === "CATEGORY" || over.id) {
        handleCategoryDragEnd(activeId, overId);
      } else {
        // console.warn(`Cannot drop Category onto target with ID ${overId} and data:`, overData);
      }
    } else if (activeType === "ITEM") {
      const sourceContainer = active.data.current.containerId as string;
      let targetContainer: string | undefined;

      // 确定放置的目标容器 ID
      if (overData?.type === "CATEGORY_CONTAINER") {
        // 拖到分类区域 (Droppable)
        targetContainer = overData.containerId as string;
      } else if (overData?.type === "ITEM") {
        // 拖到另一个 Item 上方/下方
        targetContainer = overData.containerId as string;
      } else if (overData?.type === "CATEGORY") {
        // 拖到 CategoryDraggable 附近 (可能落在 Category Header 上)
        targetContainer = overId; // 直接使用分类 ID
      } else if (overId === "uncategorized") {
        // 拖到未分类区域 (Droppable)
        targetContainer = "uncategorized";
      }

      if (targetContainer && sourceContainer !== targetContainer) {
        handleItemDragEnd(activeId, sourceContainer, targetContainer);
      } else if (!targetContainer) {
        // console.warn(`Could not determine target container for item drop. Over ID: ${overId}, Over Data:`, overData);
      }
    }
  };

  // 控制首次加载时的动画效果
  useEffect(() => {
    const hasCategorizedContent = Object.values(groupedData.categorized).some(
      (list) => list.length > 0
    );
    const hasUncategorizedContent = groupedData.uncategorized.length > 0;
    // 仅当有内容时才启用动画，避免空列表也执行动画
    setShouldAnimate(hasCategorizedContent || hasUncategorizedContent);
  }, [groupedData]);

  // 优化：仅在分类变化时重新计算 ID 列表
  const categoryIds = useMemo(
    () => sortedCategories.map((cat) => cat.id),
    [sortedCategories]
  );

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <nav className="ChatSidebar">
        <div className="ChatSidebar__scroll-area">
          {/* 分类列表 */}
          <SortableContext
            items={categoryIds}
            strategy={verticalListSortingStrategy}
          >
            {sortedCategories.map((category) => (
              <CategoryDraggable key={category.id} id={category.id}>
                <CategorySection
                  category={category}
                  items={groupedData.categorized[category.id] || []}
                  shouldAnimate={shouldAnimate}
                />
              </CategoryDraggable>
            ))}
          </SortableContext>

          {/* 未分类区域 */}
          <UncategorizedSection
            items={groupedData.uncategorized}
            shouldAnimate={shouldAnimate}
          />
        </div>

        {/* 添加分类控件 */}
        <AddCategoryControl />

        <style href="chat-sidebar">{`
          .ChatSidebar {
            display: flex;
            flex-direction: column;
            height: 100%;
            background: ${theme.background};
            padding: 12px 4px;
            box-sizing: border-box;
          }

          .ChatSidebar__scroll-area {
            flex: 1;
            overflow-y: auto;
            padding: 0 8px 12px;
            /* 补偿滚动条宽度，避免内容抖动 */
            margin-right: -4px;
          }

          .ChatSidebar__scroll-area::-webkit-scrollbar {
            width: 4px;
          }
          .ChatSidebar__scroll-area::-webkit-scrollbar-track {
            background: transparent;
          }
          .ChatSidebar__scroll-area::-webkit-scrollbar-thumb {
            background: ${theme.textLight};
            border-radius: 10px;
            opacity: 0.5;
          }
          .ChatSidebar__scroll-area::-webkit-scrollbar-thumb:hover {
            background: ${theme.textQuaternary};
          }

          .CategoryDraggable {
             /* 控制分类块之间的间距 */
             margin-bottom: 16px;
             border-radius: 8px;
             position: relative;
             background-color: transparent;
             transition: background-color 0.2s ease, box-shadow 0.2s ease;
          }
          /* 拖拽时的分类块样式 */
          .CategoryDraggable--dragging {
            background-color: ${theme.backgroundSecondary};
            box-shadow: 0 6px 16px rgba(0,0,0,0.08);
            opacity: 0.9;
            /* z-index 和 position 由 dnd-kit 的 style 属性控制 */
          }

          /* 分类区域（包括未分类）的基础样式 */
          .ChatSidebar__category {
            position: relative;
            padding: 4px 0;
            border-radius: 8px;
            transition: background-color 0.2s ease;
          }

          /* 拖拽物悬停在分类区域上时的样式 */
          .ChatSidebar__category--drag-over {
             background: ${theme.primaryGhost || "rgba(22, 119, 255, 0.06)"};
          }
          /* 拖拽物悬停在分类区域上时的边框指示 */
          .ChatSidebar__category--drag-over::after {
              content: "";
              position: absolute;
              top: -1px;
              left: -1px;
              right: -1px;
              bottom: -1px;
              border-radius: 9px;
              border: 1px dashed ${theme.primaryLight || "#91caff"};
              pointer-events: none;
              z-index: 1; /* 确保在内容之上，但在拖拽物之下 */
          }

           /* 可选：未分类区域的特定样式 */
           /* .ChatSidebar__category--uncategorized { } */

          .ChatSidebar__category-content {
            margin-top: 2px;
            padding: 0 2px;
          }

          .ItemDraggable {
             margin: 3px 0;
             position: relative;
             border-radius: 6px;
             transition: opacity 0.2s ease, box-shadow 0.2s ease;
          }
          /* 拖拽时的条目样式 */
          .ItemDraggable--dragging {
             opacity: 0.8;
             box-shadow: 0 2px 10px rgba(0,0,0,0.08);
             /* z-index 和 position 由 dnd-kit 的 style 属性控制 */
          }

          /* 条目淡入动画 */
          @keyframes itemFadeIn {
            from {
              opacity: 0;
              transform: translateY(6px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </nav>
    </DndContext>
  );
};

export default memo(ChatSidebar);
