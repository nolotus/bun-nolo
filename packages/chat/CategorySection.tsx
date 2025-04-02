// 文件路径: src/components/sidebar/CategorySection.tsx (或你的实际路径)
import React, { memo } from "react";
import { useAppSelector } from "app/hooks"; // 确认路径
import { SpaceContent } from "create/space/types"; // 确认路径
import CategoryHeader from "create/space/category/CategoryHeader"; // 确认路径
import { SidebarItem } from "./dialog/SidebarItem"; // 确认路径，假设 SidebarItem 接受 handleProps
import { useDroppable, DraggableSyntheticListeners } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ItemDraggable } from "./ChatSidebar"; // 从 ChatSidebar 导入 ItemDraggable
import { selectCollapsedCategories } from "create/space/spaceSlice"; // 确认路径
import { useTheme } from "app/theme"; // 确认路径
import { UNCATEGORIZED_ID } from "create/space/constants"; // 确认路径

// --- Props 接口 ---
interface CategorySectionProps {
  categoryId: string; // 分类的唯一 ID (可以是 UNCATEGORIZED_ID)
  categoryName: string; // 分类的显示名称
  items: SpaceContent[]; // 该分类下的内容项列表
  shouldAnimate: boolean; // 是否对内容项应用入场动画
  handleProps?: DraggableSyntheticListeners; // 拖拽分类排序的句柄 (仅用于真实分类)
}

// --- CategorySection 组件 ---
const CategorySection: React.FC<CategorySectionProps> = memo(
  ({
    categoryId,
    categoryName,
    items = [], // 提供默认空数组，防止 items 为 undefined
    shouldAnimate,
    handleProps, // 可选，未分类区域不传入
  }) => {
    const theme = useTheme(); // 获取当前主题

    // --- 计算是否为未分类区域 ---
    const isUncategorized = categoryId === UNCATEGORIZED_ID;

    // --- dnd-kit Hooks ---
    // useDroppable 使该区域可以接收拖放的元素
    const { isOver, setNodeRef } = useDroppable({
      id: categoryId, // 使用 categoryId 作为 Droppable 区域的唯一标识
      data: { containerId: categoryId, type: "CATEGORY_CONTAINER" }, // 附加数据，标记容器ID和类型
    });

    // --- Redux Hooks ---
    const collapsedCategories = useAppSelector(selectCollapsedCategories); // 获取所有折叠的分类ID
    // 检查当前分类是否处于折叠状态
    const isCollapsed = collapsedCategories[categoryId] ?? false;

    // --- CSS 类名计算 ---
    // 拖拽元素悬浮在此区域上时的类名
    const dragOverClass = isOver ? "ChatSidebar__category--drag-over" : "";
    // 如果是未分类区域，添加特定类名 (用于可能的样式区分)
    const uncategorizedClass = isUncategorized
      ? "ChatSidebar__category--uncategorized"
      : "";

    return (
      <>
        {/* 分类区域的根元素 */}
        <div
          ref={setNodeRef} // 将 ref 绑定到 Droppable 节点
          className={`ChatSidebar__category ${uncategorizedClass} ${dragOverClass}`}
        >
          {/* 渲染分类头部 */}
          <CategoryHeader
            categoryId={categoryId} // 传递分类 ID
            categoryName={categoryName} // 传递分类名称
            // 仅在不是未分类区域时传递拖拽句柄给 CategoryHeader (用于拖拽分类)
            handleProps={!isUncategorized ? handleProps : undefined}
            isDragOver={isOver} // 告知 Header 当前是否处于拖拽悬浮状态
          />

          {/* 仅在未折叠时渲染分类内容 */}
          {!isCollapsed && (
            <div className="ChatSidebar__category-content">
              {/* 可排序上下文，用于分类内项目的拖拽排序 */}
              <SortableContext
                // items 数组需要提供每个可排序元素的唯一 ID (使用 contentKey)
                items={items.map((item) => item.contentKey)}
                strategy={verticalListSortingStrategy} // 使用垂直列表排序策略
              >
                {/* 遍历并渲染分类下的每个内容项 */}
                {items.map((item) => (
                  // 使用 ItemDraggable 包裹每个可拖拽的内容项
                  <ItemDraggable
                    key={item.contentKey} // React key
                    id={item.contentKey} // Sortable 和 Draggable 的 ID
                    containerId={categoryId} // 标记该项目所属的容器 ID
                    animate={shouldAnimate} // 是否应用动画
                  >
                    {(
                      itemHandleProps // 接收 Item 的拖拽句柄
                    ) => (
                      // 渲染侧边栏项目组件，并传递 props 和拖拽句柄
                      <SidebarItem {...item} handleProps={itemHandleProps} />
                    )}
                  </ItemDraggable>
                ))}
              </SortableContext>
            </div>
          )}
        </div>

        {/* 组件内嵌样式 */}
        <style>{`
          .ChatSidebar__category {
            position: relative; /* 用于 ::after 伪元素定位 */
            border-radius: 8px;
            transition: background-color 0.2s ease;
            margin-bottom: 4px; /* 分类之间的间距 */
          }

          /* 可选：为未分类区域添加特定样式 */
          /* .ChatSidebar__category--uncategorized { border-top: 1px solid ${theme.border || "#eee"}; margin-top: 8px; padding-top: 4px; } */

          /* 拖拽悬浮时的背景 */
          .ChatSidebar__category--drag-over {
            background: ${theme.primaryGhost || "rgba(22, 119, 255, 0.06)"};
          }

          /* 拖拽悬浮时的虚线边框 */
          .ChatSidebar__category--drag-over::after {
            content: "";
            position: absolute;
            top: -1px;
            left: -1px;
            right: -1px;
            bottom: -1px;
            border-radius: 9px;
            border: 1px dashed ${theme.primaryLight || "#91caff"};
            pointer-events: none; /* 伪元素不捕获鼠标事件 */
            z-index: 1;
          }

          /* 分类内容区域 */
          .ChatSidebar__category-content {
            margin-top: 2px; /* 与头部的间距 */
            padding: 0 2px; /* 左右内边距 */
          }

          /* 项目入场动画 (可选) */
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

// 设置组件的 displayName，方便在 React DevTools 中识别
CategorySection.displayName = "CategorySection";

export default CategorySection;
