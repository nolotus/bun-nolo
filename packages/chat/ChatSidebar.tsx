import React, { memo, useState, useEffect, useMemo, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import {
  addCategory,
  selectCurrentSpace,
  updateContentCategory,
  reorderCategories,
} from "create/space/spaceSlice";
import { SpaceContent, Space } from "create/space/types";
import Button from "web/ui/Button";
import CategoryHeader from "create/space/components/CategoryHeader";
import { useTheme } from "app/theme";
import { AddCategoryModal } from "create/space/components/AddCategoryModal";
import { SidebarItem } from "./dialog/SidebarItem";

import { DndContext, DragEndEvent, useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useGroupedContent } from "./hooks/useGroupedContent";

// 分组数据：将 space 中的内容按分类分组
interface CategoryItem {
  id: string;
  name: string;
  order?: number;
}

// 拖拽排序相关 Hook
const useCategoryDragAndDrop = (
  sortedCategories: CategoryItem[],
  space: Space | null,
  dispatch: any
) => {
  return useCallback(
    (activeId: string, overId: string) => {
      if (!space?.id) return;
      const oldIndex = sortedCategories.findIndex((cat) => cat.id === activeId);
      const newIndex = sortedCategories.findIndex((cat) => cat.id === overId);
      if (oldIndex !== newIndex) {
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

// 可拖拽的分类组件
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
      {React.cloneElement(children, { handleProps: listeners })}
    </div>
  );
};

// 可拖拽的 Item 组件
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
      {React.cloneElement(children, { handleProps: listeners })}
    </div>
  );
};

// 分类区域组件
interface CategorySectionProps {
  category: CategoryItem;
  items: SpaceContent[];
  shouldAnimate: boolean;
  handleProps?: any;
}

const CategorySection: React.FC<CategorySectionProps> = memo(
  ({ category, items, shouldAnimate, handleProps }) => {
    const { isOver, setNodeRef } = useDroppable({
      id: category.id,
      data: { containerId: category.id },
    });
    return (
      <div
        ref={setNodeRef}
        className={`category-section ${isOver ? "drag-over" : ""}`}
      >
        <CategoryHeader
          categoryId={category.id}
          categoryName={category.name}
          handleProps={handleProps}
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

// 未分类区域组件
interface UncategorizedSectionProps {
  items: SpaceContent[];
  shouldAnimate: boolean;
}

const UncategorizedSection: React.FC<UncategorizedSectionProps> = memo(
  ({ items, shouldAnimate }) => {
    const { isOver, setNodeRef } = useDroppable({
      id: "uncategorized",
      data: { containerId: "uncategorized" },
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

// 主组件
const ChatSidebar: React.FC = () => {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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
    if (!active.data.current || !over) return;
    const type = active.data.current.type;
    if (type === "CATEGORY") {
      handleCategoryDragEnd(active.id as string, over.id as string);
    } else if (type === "ITEM") {
      const sourceContainer = active.data.current.containerId;
      const targetContainer = (over.data.current?.containerId ||
        over.id) as string;
      handleItemDragEnd(active.id as string, sourceContainer, targetContainer);
    }
  };

  useEffect(() => {
    const hasContent =
      groupedData.uncategorized.length > 0 ||
      Object.values(groupedData.categorized).some((list) => list.length > 0);
    setShouldAnimate(hasContent);
  }, [groupedData]);

  const handleAddCategory = () => setIsAddModalOpen(true);
  const handleAddCategoryConfirm = (name: string) => {
    dispatch(addCategory({ name }));
    setIsAddModalOpen(false);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <nav className="chat-sidebar">
        <div className="scroll-area">
          {sortedCategories.length > 0 && (
            <SortableContext
              items={sortedCategories.map((cat) => cat.id)}
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
          )}
          <UncategorizedSection
            items={groupedData.uncategorized}
            shouldAnimate={shouldAnimate}
          />
        </div>

        <div className="button-container">
          <Button
            block
            variant="secondary"
            size="medium"
            onClick={handleAddCategory}
            className="add-category-button"
          >
            添加分类
          </Button>
        </div>

        <AddCategoryModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddCategory={handleAddCategoryConfirm}
        />

        <style jsx>{`
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
            margin-right: -4px;
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
            position: relative;
            margin-bottom: 16px;
            padding: 4px 0;
            border-radius: 8px;
            transition:
              background-color 0.2s ease,
              transform 0.15s ease;
          }

          .category-section.drag-over {
            background: ${theme.primaryGhost || "rgba(22, 119, 255, 0.06)"};
            transform: translateY(2px);
          }

          .category-section.drag-over::after {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 8px;
            box-shadow: 0 0 0 2px ${theme.primaryLight};
            pointer-events: none;
          }

          .category-content {
            margin-top: 2px;
            padding: 0 2px;
          }

          .button-container {
            padding: 4px 12px 4px;
            margin-top: 4px;
          }

          .add-category-button {
            transition: all 0.2s ease;
            background: ${theme.backgroundSecondary};
            border: none;
            border-radius: 8px;
            color: ${theme.textSecondary};
            font-weight: 500;
            height: 36px;
          }

          .add-category-button:hover {
            background: ${theme.primaryGhost || "rgba(22, 119, 255, 0.06)"};
            color: ${theme.primary};
            transform: translateY(-1px);
          }

          .add-category-button:active {
            transform: translateY(0);
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
