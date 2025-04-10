// 文件路径: chat/ChatSidebar.tsx
import React, { memo, useState, useEffect, useCallback, useMemo } from "react";
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
  const [shouldAnimate, setShouldAnimate] = useState(false); // 控制首次动画状态
  const dispatch = useAppDispatch();
  const space = useAppSelector(selectCurrentSpace); // 获取当前空间数据
  const theme = useTheme(); // 获取主题

  // 使用自定义 Hook 获取分组和排序后的数据
  const { groupedData, sortedCategories } = useGroupedContent(space);

  // 获取拖放处理函数
  const handleCategoryDragEnd = useCategoryDragAndDrop(
    sortedCategories,
    space,
    dispatch
  );
  const handleItemDragEnd = useItemDragAndDrop(space, dispatch);

  // ---- 可选：优化拖拽传感器 ----
  // const sensors = useSensors(
  //   useSensor(PointerSensor, {
  //     // 需要移动一定距离才开始拖拽，防止误触
  //     activationConstraint: {
  //       distance: 8,
  //     },
  //   }),
  //   useSensor(KeyboardSensor, {
  //     // 使用键盘协调器处理排序
  //     coordinateGetter: sortableKeyboardCoordinates,
  //   })
  // );
  // ---- 如果使用 sensors，则在 DndContext 中添加 sensors={sensors} ----

  // --- 拖放结束事件处理器 ---
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // 结束时没有悬浮目标，或活动元素数据不存在，则返回
    if (!over || !active.data.current) {
      // console.log("Drag end ignored: No 'over' or 'active.data.current'");
      return;
    }

    const activeId = active.id as string; // 被拖拽元素的 ID
    const overId = over.id as string; // 悬浮目标的 ID
    const activeType = active.data.current.type as string; // 被拖拽元素的类型
    const overData = over.data.current; // 悬浮目标的数据

    // 如果拖拽到自身，忽略
    if (activeId === overId) {
      // console.log("Drag end ignored: activeId === overId");
      return;
    }

    // --- 情况一：拖拽的是分类 (CATEGORY) ---
    if (activeType === "CATEGORY") {
      // 检查悬浮目标是否也是分类 (通过 overData.type 或直接判断 overId 是否是有效分类ID)
      // 假设不能将分类拖到未分类区域 (overId !== UNCATEGORIZED_ID)
      const isOverCategory =
        overData?.type === "CATEGORY" ||
        sortedCategories.some((cat) => cat.id === overId);

      if (isOverCategory && overId !== UNCATEGORIZED_ID) {
        handleCategoryDragEnd(activeId, overId);
      } else {
        // console.log("Drag end ignored: Cannot drag category over non-category or uncategorized");
      }
    }
    // --- 情况二：拖拽的是项目 (ITEM) ---
    else if (activeType === "ITEM") {
      const sourceContainer = active.data.current.containerId as string; // 源容器 ID
      let targetContainer: string | undefined; // 目标容器 ID

      // 根据悬浮目标的类型确定目标容器 ID
      if (overData?.type === "CATEGORY_CONTAINER") {
        // 情况 A: 直接落在分类的 Droppable 区域 (包括未分类区域的容器)
        targetContainer = overData.containerId as string;
      } else if (overData?.type === "ITEM") {
        // 情况 B: 落在另一个 Item 上，目标容器是该 Item 的容器
        targetContainer = overData.containerId as string;
      } else if (overData?.type === "CATEGORY") {
        // 情况 C: 落在分类的 Draggable 区域 (通常是 CategoryHeader)
        targetContainer = overId; // 目标容器 ID 就是这个分类的 ID
      }
      // 不需要单独处理 overId === UNCATEGORIZED_ID，情况 A 会覆盖

      // 如果成功确定了目标容器，并且与源容器不同
      if (
        targetContainer !== undefined &&
        sourceContainer !== targetContainer
      ) {
        handleItemDragEnd(activeId, sourceContainer, targetContainer);
      } else {
        // console.log("Drag end ignored: Target container undefined or same as source");
      }
    } else {
      // console.log("Drag end ignored: Unknown activeType", activeType);
    }
  };

  // 控制首次加载时的动画效果 (逻辑不变)
  useEffect(() => {
    const hasCategorizedContent = Object.values(groupedData.categorized).some(
      (list) => list.length > 0
    );
    const hasUncategorizedContent = groupedData.uncategorized.length > 0;
    setShouldAnimate(hasCategorizedContent || hasUncategorizedContent);
  }, [groupedData]);

  // 缓存分类 ID 列表，用于 SortableContext
  const categoryIds = useMemo(
    () => sortedCategories.map((cat) => cat.id),
    [sortedCategories]
  );

  return (
    // 拖放上下文，提供给所有子组件
    <DndContext onDragEnd={handleDragEnd /* sensors={sensors} */}>
      <nav className="ChatSidebar">
        {/* 可滚动区域 */}
        <div className="ChatSidebar__scroll-area">
          {/* 分类排序上下文 */}
          <SortableContext
            items={categoryIds} // 提供可排序分类的 ID 列表
            strategy={verticalListSortingStrategy} // 使用垂直列表排序策略
          >
            {/* 遍历并渲染已排序的分类 */}
            {sortedCategories.map((category) => (
              <CategoryDraggable key={category.id} id={category.id}>
                {(
                  handleProps // 使用函数子元素传递拖拽句柄
                ) => (
                  <CategorySection
                    categoryId={category.id} // 直接传递 ID
                    categoryName={category.name} // 直接传递名称
                    items={groupedData.categorized[category.id] || []} // 获取该分类下的内容
                    shouldAnimate={shouldAnimate} // 是否应用动画
                    handleProps={handleProps} // 传递拖拽句柄给 CategorySection -> CategoryHeader
                  />
                )}
              </CategoryDraggable>
            ))}
          </SortableContext>

          {/* 渲染未分类区域 */}
          {/* 仅当有未分类内容时才渲染 */}
          {groupedData.uncategorized.length > 0 && (
            <CategorySection
              key={UNCATEGORIZED_ID} // 使用常量作为 key
              categoryId={UNCATEGORIZED_ID} // 传递未分类 ID
              categoryName="未分类" // 显示名称
              items={groupedData.uncategorized} // 未分类内容列表
              shouldAnimate={shouldAnimate} // 是否应用动画
              // 注意：不包裹在 CategoryDraggable 中，不传递 handleProps
            />
          )}
        </div>

        {/* 组件内嵌样式 */}
        <style>{`
          .ChatSidebar {
            display: flex;
            flex-direction: column;
            height: 100%;
            background: ${theme.background}; /* 使用主题背景色 */
            padding: 12px 4px; /* 内边距 */
            box-sizing: border-box;
          }

          .ChatSidebar__scroll-area {
            flex: 1; /* 占据剩余空间 */
            overflow-y: auto; /* 垂直滚动 */
            padding: 0 8px 12px; /* 滚动区域内边距 */
            margin-right: -4px; /* 隐藏滚动条视觉影响 */
          }

          /* 自定义滚动条样式 (可选) */
          .ChatSidebar__scroll-area::-webkit-scrollbar {
            width: 4px;
          }
          .ChatSidebar__scroll-area::-webkit-scrollbar-track {
            background: transparent;
          }
          .ChatSidebar__scroll-area::-webkit-scrollbar-thumb {
            background: ${theme.textLight || "#ccc"}; /* 使用主题颜色 */
            border-radius: 10px;
            opacity: 0.5;
          }
          .ChatSidebar__scroll-area::-webkit-scrollbar-thumb:hover {
            background: ${theme.textQuaternary || "#aaa"}; /* 使用主题颜色 */
          }

          /* 可拖拽分类容器样式 */
          .CategoryDraggable {
            border-radius: 8px;
            position: relative;
            background-color: transparent;
            transition: background-color 0.2s ease, box-shadow 0.2s ease;
            margin-bottom: 4px; /* 分类间距 */
          }

          /* 拖拽分类时的样式 */
          .CategoryDraggable--dragging {
            background-color: ${theme.backgroundSecondary || "#f0f0f0"}; /* 使用主题背景色 */
            box-shadow: 0 6px 16px rgba(0,0,0,0.08); /* 添加阴影 */
            opacity: 0.9; /* 轻微透明 */
          }

          /* 可拖拽项目容器样式 */
          .ItemDraggable {
            margin: 3px 0; /* 项目上下间距 */
            position: relative;
            border-radius: 6px;
            transition: opacity 0.2s ease, box-shadow 0.2s ease;
          }

          /* 拖拽项目时的样式 */
          .ItemDraggable--dragging {
            opacity: 0.8; /* 轻微透明 */
            box-shadow: 0 2px 10px rgba(0,0,0,0.08); /* 添加阴影 */
            /* background-color: ${theme.background}; */ /* 可选：设置背景以防透明 */
            /* z-index: 10; */ /* 可选：确保在顶层 */
          }

          /* 项目入场动画 */
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

export default memo(ChatSidebar); // 使用 memo 优化性能
