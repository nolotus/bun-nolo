import React, { memo, useState, useEffect, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import {
  selectCurrentSpace,
  updateContentCategory,
  reorderCategories,
} from "create/space/spaceSlice";
import { Space } from "create/space/types";
import { useTheme } from "app/theme";

import { DndContext, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useGroupedContent } from "./hooks/useGroupedContent";

import AddCategoryControl from "create/space/components/AddCategoryControl";
import CategorySection, { UncategorizedSection } from "./CategorySection";

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

export const ItemDraggable: React.FC<ItemDraggableProps> = ({
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
      {React.cloneElement(children as React.ReactElement, {
        handleProps: listeners,
      })}
    </div>
  );
};

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
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;
    const activeType = active.data.current.type;
    const overData = over.data.current;

    if (activeId === overId) return;

    if (activeType === "CATEGORY") {
      if (overData?.type === "CATEGORY" || over.id) {
        handleCategoryDragEnd(activeId, overId);
      }
    } else if (activeType === "ITEM") {
      const sourceContainer = active.data.current.containerId as string;
      let targetContainer: string | undefined;

      if (overData?.type === "CATEGORY_CONTAINER") {
        targetContainer = overData.containerId as string;
      } else if (overData?.type === "ITEM") {
        targetContainer = overData.containerId as string;
      } else if (overData?.type === "CATEGORY") {
        targetContainer = overId;
      } else if (overId === "uncategorized") {
        targetContainer = "uncategorized";
      }

      if (targetContainer && sourceContainer !== targetContainer) {
        handleItemDragEnd(activeId, sourceContainer, targetContainer);
      }
    }
  };

  // 控制首次加载时的动画效果
  useEffect(() => {
    const hasCategorizedContent = Object.values(groupedData.categorized).some(
      (list) => list.length > 0
    );
    const hasUncategorizedContent = groupedData.uncategorized.length > 0;
    setShouldAnimate(hasCategorizedContent || hasUncategorizedContent);
  }, [groupedData]);

  const categoryIds = useMemo(
    () => sortedCategories.map((cat) => cat.id),
    [sortedCategories]
  );

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <nav className="ChatSidebar">
        <div className="ChatSidebar__scroll-area">
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

          <UncategorizedSection
            items={groupedData.uncategorized}
            shouldAnimate={shouldAnimate}
          />
        </div>

        <AddCategoryControl />

        <style>{`
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
            border-radius: 8px;
            position: relative;
            background-color: transparent;
            transition: background-color 0.2s ease, box-shadow 0.2s ease;
          }

          .CategoryDraggable--dragging {
            background-color: ${theme.backgroundSecondary};
            box-shadow: 0 6px 16px rgba(0,0,0,0.08);
            opacity: 0.9;
          }

          .ItemDraggable {
            margin: 3px 0;
            position: relative;
            border-radius: 6px;
            transition: opacity 0.2s ease, box-shadow 0.2s ease;
          }

          .ItemDraggable--dragging {
            opacity: 0.8;
            box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          }

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
