import React, { memo } from "react";
import { useAppSelector } from "app/hooks"; // 引入 useAppSelector
import { SpaceContent } from "create/space/types"; // 引入类型
import CategoryHeader from "create/space/components/CategoryHeader"; // 引入 Header
import { SidebarItem } from "./dialog/SidebarItem"; // 引入 Item 组件
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
// 假设 ItemDraggable 是从 ChatSidebar.tsx 导出的
// 如果不是，请确保从正确的文件导入
import { ItemDraggable } from "./ChatSidebar"; // <--- 确认此导入路径！

// 导入 Redux selector (selectCollapsedCategories 已包含)
import { selectCollapsedCategories } from "create/space/spaceSlice";

// 定义 CategoryItem 类型（如果尚未在别处定义）
interface CategoryItem {
  id: string;
  name: string;
  order?: number;
}

// 定义 Props 类型
interface CategorySectionProps {
  category: CategoryItem;
  items: SpaceContent[]; // 分类下的内容项
  shouldAnimate: boolean; // 是否应用动画
  handleProps?: any; // dnd-kit 拖拽句柄 (传递给 Header)
}

const CategorySection: React.FC<CategorySectionProps> = memo(
  ({ category, items = [], shouldAnimate, handleProps }) => {
    // 为 items 提供默认空数组
    // 设置 Droppable 区域，用于接收拖拽的 Item
    const { isOver, setNodeRef } = useDroppable({
      id: category.id, // 使用分类 ID 作为 Droppable 的 ID
      data: { containerId: category.id, type: "CATEGORY_CONTAINER" }, // 附加数据
    });

    // 从 Redux 获取当前分类的折叠状态
    const collapsedCategories = useAppSelector(selectCollapsedCategories);
    const isCollapsed = collapsedCategories[category.id] ?? false; // 默认不折叠

    // 根据是否悬停添加 CSS 类
    const dragOverClass = isOver ? "ChatSidebar__category--drag-over" : "";

    return (
      <div
        ref={setNodeRef} // 应用 ref 到 Droppable 容器
        className={`ChatSidebar__category ${dragOverClass}`} // 应用基础和拖拽悬停类
      >
        {/* 渲染分类头部 */}
        <CategoryHeader
          categoryId={category.id}
          categoryName={category.name}
          handleProps={handleProps} // 将拖拽句柄传递给 Header
          isDragOver={isOver} // 将悬停状态传递给 Header (如果 Header 需要根据这个改变样式)
          // isCollapsed 不再需要作为 prop 传递，Header 内部会自行获取
        />

        {/* 条件渲染分类内容区域 (仅在未折叠时渲染) */}
        {!isCollapsed && (
          <div className="ChatSidebar__category-content">
            {/* 为分类下的 Item 提供可排序上下文 */}
            <SortableContext
              items={items.map((item) => item.contentKey)} // 提供 Item 的 ID 列表
              strategy={verticalListSortingStrategy} // 使用垂直列表排序策略
            >
              {/* 遍历并渲染每个 Item */}
              {items.map((item) => (
                // 使用 ItemDraggable 包裹 SidebarItem 以实现拖拽
                <ItemDraggable
                  key={item.contentKey}
                  id={item.contentKey} // Item 的唯一 ID
                  containerId={category.id} // Item 所属的容器 ID
                  animate={shouldAnimate} // 是否应用动画
                >
                  {/* 实际的 Item 展示组件 */}
                  <SidebarItem {...item} />
                </ItemDraggable>
              ))}
            </SortableContext>
          </div>
        )}
      </div>
    );
  }
);

// 添加 displayName 方便调试
CategorySection.displayName = "CategorySection";

export default CategorySection;

// --- UncategorizedSection ---

interface UncategorizedSectionProps {
  items: SpaceContent[];
  shouldAnimate: boolean;
}

export const UncategorizedSection: React.FC<UncategorizedSectionProps> = memo(
  ({ items = [], shouldAnimate }) => {
    // 为 items 提供默认空数组
    const { isOver, setNodeRef } = useDroppable({
      id: "uncategorized", // 固定 ID
      data: { containerId: "uncategorized", type: "CATEGORY_CONTAINER" },
    });
    const dragOverClass = isOver ? "ChatSidebar__category--drag-over" : "";

    // --- 获取未分类的折叠状态 ---
    const collapsedCategories = useAppSelector(selectCollapsedCategories);
    const isCollapsed = collapsedCategories["uncategorized"] ?? false; // 检查 "uncategorized" key

    return (
      <div
        ref={setNodeRef}
        className={`ChatSidebar__category ChatSidebar__category--uncategorized ${dragOverClass}`}
      >
        {/* 未分类的 Header，categoryId 固定，没有 handleProps */}
        {/* CategoryHeader 内部会自己处理折叠状态 */}
        <CategoryHeader
          categoryId="uncategorized"
          categoryName="未分类"
          isDragOver={isOver}
          // handleProps 不传递，因为未分类不可拖动排序
        />

        {/* --- 条件渲染内容区域 --- */}
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
    );
  }
);

UncategorizedSection.displayName = "UncategorizedSection";
