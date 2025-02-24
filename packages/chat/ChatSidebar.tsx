//────────────────────────────
// Imports
//────────────────────────────
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

//────────────────────────────
// Types
//────────────────────────────
interface CategoryItem {
  id: string;
  name: string;
  order?: number;
}

interface GroupedContent {
  categorized: Record<string, SpaceContent[]>;
  uncategorized: SpaceContent[];
}

//────────────────────────────
// Hooks
//────────────────────────────
const useGroupedContent = (space: Space | null) => {
  return useMemo(() => {
    if (!space) {
      return {
        groupedData: {
          categorized: {},
          uncategorized: [],
        } as GroupedContent,
        sortedCategories: [] as CategoryItem[],
      };
    }

    const { contents, categories } = space;
    const categorized: Record<string, SpaceContent[]> = {};
    const uncategorized: SpaceContent[] = [];

    // Initialize categories
    if (categories) {
      Object.keys(categories).forEach((categoryId) => {
        categorized[categoryId] = [];
      });
    }

    // Sort and group contents
    if (contents) {
      Object.values(contents)
        .sort((a, b) => {
          const timeA = new Date(a.updatedAt || a.createdAt).getTime();
          const timeB = new Date(b.updatedAt || b.createdAt).getTime();
          return timeB - timeA;
        })
        .forEach((item) => {
          if (categories && item.categoryId && categories[item.categoryId]) {
            categorized[item.categoryId].push(item);
          } else {
            uncategorized.push(item);
          }
        });
    }

    // Sort categories by order
    const sortedCategories = categories
      ? Object.entries(categories)
          .map(([id, category]) => ({
            id,
            ...category,
          }))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      : [];

    return {
      groupedData: { categorized, uncategorized },
      sortedCategories,
    };
  }, [space]);
};

const useCategoryDragAndDrop = (
  sortedCategories: CategoryItem[],
  space: Space | null,
  dispatch: AppDispatch
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

const useItemDragAndDrop = (space: Space | null, dispatch: AppDispatch) => {
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

//────────────────────────────
// Draggable Category Components
//────────────────────────────
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
    zIndex: isDragging ? 1 : 0,
    position: isDragging ? ("relative" as const) : ("static" as const),
    ...(isDragging && {
      backgroundColor: "var(--background-secondary)",
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    }),
  };

  return (
    <div ref={setNodeRef} style={style}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            dragHandleProps: { ...attributes, ...listeners },
          });
        }
        return child;
      })}
    </div>
  );
};

//────────────────────────────
// Draggable Item Components
//────────────────────────────
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
    opacity: isDragging ? 0.7 : 1,
    position: isDragging ? ("relative" as const) : ("static" as const),
    zIndex: isDragging ? 1 : 0,
    animation: animate ? "slideInLeft 0.2s ease-out both" : "none",
    margin: "4px 0",
    ...(isDragging && {
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    }),
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
};

//────────────────────────────
// Container Components
//────────────────────────────
interface CategoryContentContainerProps {
  containerId: string;
  children: React.ReactNode;
}

const CategoryContentContainer: React.FC<CategoryContentContainerProps> = ({
  containerId,
  children,
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: containerId,
    data: { containerId },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        padding: "4px 0",
        borderRadius: "4px",
        transition: "all 0.2s ease",
        backgroundColor: isOver ? "rgba(0,150,250,0.1)" : "transparent",
        outline: isOver ? "1px dashed rgba(0,150,250,0.5)" : "none",
      }}
    >
      {children}
    </div>
  );
};

//────────────────────────────
// Category Section Components
//────────────────────────────
interface CategorySectionProps {
  category: CategoryItem;
  items: SpaceContent[];
  shouldAnimate: boolean;
  dragHandleProps?: any;
}

const CategorySection = memo(
  ({
    category,
    items,
    shouldAnimate,
    dragHandleProps,
  }: CategorySectionProps) => {
    return (
      <div className="category-section">
        <CategoryHeader
          categoryId={category.id}
          categoryName={category.name}
          handleProps={dragHandleProps}
        />
        <CategoryContentContainer containerId={category.id}>
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
        </CategoryContentContainer>
      </div>
    );
  }
);

interface UncategorizedSectionProps {
  items: SpaceContent[];
  shouldAnimate: boolean;
}

const UncategorizedSection = memo(
  ({ items, shouldAnimate }: UncategorizedSectionProps) => {
    return (
      <div className="category-section">
        <CategoryHeader
          categoryId="uncategorized"
          categoryName="未分类"
          isDragOver={false}
        />
        <CategoryContentContainer containerId="uncategorized">
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
        </CategoryContentContainer>
      </div>
    );
  }
);

//────────────────────────────
// Main Component
//────────────────────────────
const ChatSidebar = () => {
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
      const targetContainer = over.data.current?.containerId || over.id;
      handleItemDragEnd(
        active.id as string,
        sourceContainer as string,
        targetContainer as string
      );
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

  const hasAnyContent =
    (sortedCategories.length > 0 &&
      Object.values(groupedData.categorized).some((list) => list.length > 0)) ||
    groupedData.uncategorized.length > 0;

  if (!hasAnyContent) return null;

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

        <style>
          {`
            .chat-sidebar {
              display: flex;
              flex-direction: column;
              height: 100%;
              background: ${theme.backgroundSecondary};
              padding: 8px 0;
            }
            .scroll-area {
              flex: 1;
              overflow-y: auto;
              padding-bottom: 8px;
            }
            .scroll-area::-webkit-scrollbar {
              width: 6px;
            }
            .scroll-area::-webkit-scrollbar-track {
              background: transparent;
            }
            .scroll-area::-webkit-scrollbar-thumb {
              background: ${theme.border};
              border-radius: 3px;
            }
            .category-section {
              position: relative;
              margin-bottom: 12px;
              padding: 4px;
              transition: all 0.2s ease-out;
              background: ${theme.backgroundSecondary};
              border-radius: 6px;
            }
            .button-container {
              padding: 8px 16px;
            }
            .add-category-button {
              transition: all 0.2s ease-out;
              background: ${theme.backgroundSecondary};
              border: 1px solid ${theme.border};
              color: ${theme.textSecondary};
            }
            .add-category-button:hover {
              background: ${theme.backgroundHover};
              border-color: ${theme.border};
              color: ${theme.text};
            }
            @keyframes slideInLeft {
              from {
                opacity: 0;
                transform: translateX(-10px);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }
          `}
        </style>
      </nav>
    </DndContext>
  );
};

export default memo(ChatSidebar);
