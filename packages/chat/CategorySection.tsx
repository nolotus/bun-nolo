import React, { memo } from "react";
import { useAppSelector } from "app/hooks";
import { SpaceContent } from "create/space/types";
import CategoryHeader from "create/space/components/CategoryHeader";
import { SidebarItem } from "./dialog/SidebarItem";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ItemDraggable } from "./ChatSidebar";
import { selectCollapsedCategories } from "create/space/spaceSlice";
import { useTheme } from "app/theme";

interface CategoryItem {
  id: string;
  name: string;
  order?: number;
}

interface CategorySectionProps {
  category: CategoryItem;
  items: SpaceContent[];
  shouldAnimate: boolean;
  handleProps?: any;
}

const CategorySection: React.FC<CategorySectionProps> = memo(
  ({ category, items = [], shouldAnimate, handleProps }) => {
    const theme = useTheme();
    const { isOver, setNodeRef } = useDroppable({
      id: category.id,
      data: { containerId: category.id, type: "CATEGORY_CONTAINER" },
    });

    const collapsedCategories = useAppSelector(selectCollapsedCategories);
    const isCollapsed = collapsedCategories[category.id] ?? false;
    const dragOverClass = isOver ? "ChatSidebar__category--drag-over" : "";

    return (
      <>
        <div
          ref={setNodeRef}
          className={`ChatSidebar__category ${dragOverClass}`}
        >
          <CategoryHeader
            categoryId={category.id}
            categoryName={category.name}
            handleProps={handleProps}
            isDragOver={isOver}
          />

          {!isCollapsed && (
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
                    <SidebarItem {...item} />
                  </ItemDraggable>
                ))}
              </SortableContext>
            </div>
          )}
        </div>

        <style>{`
          .ChatSidebar__category {
            position: relative;
            border-radius: 8px;
            transition: background-color 0.2s ease;
          }

          .ChatSidebar__category--drag-over {
            background: ${theme.primaryGhost || "rgba(22, 119, 255, 0.06)"};
          }

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
            z-index: 1;
          }

          .ChatSidebar__category-content {
            margin-top: 2px;
            padding: 0 2px;
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
      </>
    );
  }
);

CategorySection.displayName = "CategorySection";

export default CategorySection;

export const UncategorizedSection: React.FC<UncategorizedSectionProps> = memo(
  ({ items = [], shouldAnimate }) => {
    const theme = useTheme();
    const { isOver, setNodeRef } = useDroppable({
      id: "uncategorized",
      data: { containerId: "uncategorized", type: "CATEGORY_CONTAINER" },
    });
    const dragOverClass = isOver ? "ChatSidebar__category--drag-over" : "";
    const collapsedCategories = useAppSelector(selectCollapsedCategories);
    const isCollapsed = collapsedCategories["uncategorized"] ?? false;

    return (
      <>
        <div
          ref={setNodeRef}
          className={`ChatSidebar__category ChatSidebar__category--uncategorized ${dragOverClass}`}
        >
          <CategoryHeader
            categoryId="uncategorized"
            categoryName="未分类"
            isDragOver={isOver}
          />

          {!isCollapsed && (
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
                    <SidebarItem {...item} />
                  </ItemDraggable>
                ))}
              </SortableContext>
            </div>
          )}
        </div>
      </>
    );
  }
);

UncategorizedSection.displayName = "UncategorizedSection";
