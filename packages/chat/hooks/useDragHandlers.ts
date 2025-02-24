// chat/hooks/useDragHandlers.ts
import { useCallback } from "react";
import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useAppDispatch } from "app/hooks";
import {
  reorderCategories,
  updateContentCategory,
} from "create/space/spaceSlice";
import { Category } from "create/space/types";

interface UseDragHandlersProps {
  spaceId?: string;
  sortedCategories: (Category & { id: string })[];
}

export const useDragHandlers = ({
  spaceId,
  sortedCategories,
}: UseDragHandlersProps) => {
  const dispatch = useAppDispatch();

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!active.data.current || !active.data.current.type) return;
      const type = active.data.current.type;

      if (type === "CATEGORY") {
        if (!over || active.id === over.id) return;
        const oldIndex = sortedCategories.findIndex(
          (cat) => cat.id === active.id
        );
        const newIndex = sortedCategories.findIndex(
          (cat) => cat.id === over.id
        );
        const newOrder = arrayMove(
          sortedCategories.map((cat) => cat.id),
          oldIndex,
          newIndex
        );
        if (spaceId) {
          dispatch(
            reorderCategories({
              spaceId,
              sortedCategoryIds: newOrder,
            })
          );
        }
      } else if (type === "ITEM") {
        const activeContainer = active.data.current.containerId;
        const overContainer =
          (over && over.data.current && over.data.current.containerId) ||
          over?.id;
        if (!overContainer) return;
        if (activeContainer !== overContainer) {
          if (spaceId) {
            dispatch(
              updateContentCategory({
                spaceId,
                contentKey: active.id as string,
                categoryId:
                  overContainer === "uncategorized"
                    ? ""
                    : (overContainer as string),
              })
            );
          }
        }
      }
    },
    [dispatch, sortedCategories, spaceId]
  );

  return { handleDragEnd };
};
