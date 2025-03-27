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
import { SidebarItem } from "./dialog/SidebarItem"; // Adjust path if necessary

import { DndContext, DragEndEvent, useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useGroupedContent } from "./hooks/useGroupedContent"; // Adjust path if necessary

import AddCategoryControl from "create/space/components/AddCategoryControl"; // Corrected import path

interface CategoryItem {
  id: string;
  name: string;
  order?: number;
}

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
    ...(isDragging && {
      backgroundColor: "var(--background-secondary)",
      boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
      opacity: 0.9,
    }),
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
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
    opacity: isDragging ? 0.8 : 1,
    position: isDragging ? ("relative" as const) : ("static" as const),
    zIndex: isDragging ? 2 : 0,
    animation: animate ? "fadeIn 0.3s ease-out" : "none",
    margin: "3px 0",
    ...(isDragging && {
      boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    }),
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {React.cloneElement(children as React.ReactElement, {
        handleProps: listeners,
      })}
    </div>
  );
};

interface CategorySectionProps {
  category: CategoryItem;
  items: SpaceContent[];
  shouldAnimate: boolean;
  handleProps?: any; // Passed down from CategoryDraggable
}

const CategorySection: React.FC<CategorySectionProps> = memo(
  ({ category, items, shouldAnimate, handleProps }) => {
    const { isOver, setNodeRef } = useDroppable({
      id: category.id,
      data: { containerId: category.id, type: "CATEGORY_CONTAINER" }, // Add type for clarity
    });
    return (
      <div
        ref={setNodeRef}
        className={`category-section ${isOver ? "drag-over" : ""}`}
      >
        <CategoryHeader
          categoryId={category.id}
          categoryName={category.name}
          handleProps={handleProps} // Pass handleProps to CategoryHeader
        />
        <div className="category-content">
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
      data: { containerId: "uncategorized", type: "CATEGORY_CONTAINER" }, // Add type for clarity
    });
    return (
      <div
        ref={setNodeRef}
        className={`category-section ${isOver ? "drag-over" : ""}`}
      >
        <CategoryHeader categoryId="uncategorized" categoryName="未分类" />
        <div className="category-content">
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
                <SidebarItem {...item} />
              </ItemDraggable>
            ))}
          </SortableContext>
        </div>
      </div>
    );
  }
);

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Ensure we have valid active and over elements
    if (!over || !active.data.current) {
      console.warn("DragEnd event missing active or over data.");
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;
    const activeType = active.data.current.type;
    const overData = over.data.current;

    if (activeId === overId) {
      // No movement needed
      return;
    }

    if (activeType === "CATEGORY") {
      // Dragging a Category over another Category
      if (overData?.type === "CATEGORY" || over.id) {
        // Check if over is a category or a category ID directly
        handleCategoryDragEnd(activeId, overId);
      } else {
        console.warn(
          `Cannot drop Category onto target with ID ${overId} and data:`,
          overData
        );
      }
    } else if (activeType === "ITEM") {
      const sourceContainer = active.data.current.containerId as string;
      let targetContainer: string | undefined;

      // Determine the target container ID
      if (overData?.type === "CATEGORY_CONTAINER") {
        targetContainer = overData.containerId as string; // Dropped onto a category section (droppable)
      } else if (overData?.type === "ITEM") {
        targetContainer = overData.containerId as string; // Dropped onto another item
      } else if (overData?.type === "CATEGORY") {
        // Sometimes the 'over' might be the CategoryDraggable itself if dropped near the header
        targetContainer = overId; // Use the category ID directly
      } else if (overId === "uncategorized") {
        // Directly dropped onto the 'uncategorized' droppable ID
        targetContainer = "uncategorized";
      }

      if (targetContainer && sourceContainer !== targetContainer) {
        handleItemDragEnd(activeId, sourceContainer, targetContainer);
      } else if (!targetContainer) {
        console.warn(
          `Could not determine target container for item drop. Over ID: ${overId}, Over Data:`,
          overData
        );
      }
    }
  };

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
  const uncategorizedItemIds = useMemo(
    () => groupedData.uncategorized.map((item) => item.contentKey),
    [groupedData.uncategorized]
  );
  const categorizedItemIds = useMemo(() => {
    return sortedCategories.reduce((acc, category) => {
      const items = groupedData.categorized[category.id] || [];
      return [...acc, ...items.map((item) => item.contentKey)];
    }, [] as string[]);
  }, [sortedCategories, groupedData.categorized]);

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <nav className="chat-sidebar">
        <div className="scroll-area">
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

        <style href="chat-sidebar">{`
          .chat-sidebar {
            display: flex;
            flex-direction: column;
            height: 100%;
            background: ${theme.background};
            padding: 12px 4px;
          }

          .scroll-area {
            flex: 1;
            overflow-y: auto;
            padding: 0 8px 12px;
            margin-right: -4px; /* Compensate for scrollbar width */
          }

          .scroll-area::-webkit-scrollbar {
            width: 4px;
          }

          .scroll-area::-webkit-scrollbar-track {
            background: transparent;
          }

          .scroll-area::-webkit-scrollbar-thumb {
            background: ${theme.textLight};
            border-radius: 10px;
            opacity: 0.5;
          }

          .scroll-area::-webkit-scrollbar-thumb:hover {
            background: ${theme.textQuaternary};
          }

          .category-section {
            position: relative; /* Needed for drag-over pseudo-element */
            margin-bottom: 16px;
            padding: 4px 0;
            border-radius: 8px;
            transition:
              background-color 0.2s ease,
              transform 0.15s ease; /* Added transform transition */
             /* border: 1px solid transparent; // Add transparent border */
          }

          .category-section.drag-over {
             background: ${theme.primaryGhost || "rgba(22, 119, 255, 0.06)"};
             /* transform: translateY(2px); // Optional visual cue */
          }

          .category-section.drag-over::after {
              content: "";
              position: absolute;
              top: -1px; /* Adjust to cover border */
              left: -1px;
              right: -1px;
              bottom: -1px;
              border-radius: 9px; /* Slightly larger than section radius */
              border: 1px dashed ${theme.primaryLight || "#91caff"}; /* Use dashed border */
              /* box-shadow: 0 0 0 2px ${theme.primaryLight}; */
              pointer-events: none;
              z-index: 1; /* Ensure it's above content but below dragged item */
          }


          .category-content {
            margin-top: 2px;
            padding: 0 2px; /* Minimal horizontal padding */
          }

          @keyframes fadeIn {
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
