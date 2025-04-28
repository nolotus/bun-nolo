// 文件路径: src/components/sidebar/CategorySection.tsx (或你的实际路径)
import React, { memo } from "react";
import { useAppSelector } from "app/hooks"; // 确认路径
import { SpaceContent } from "create/space/types"; // 确认路径
import CategoryHeader from "create/space/category/CategoryHeader"; // 确认路径
import SidebarItem from "create/space/SidebarItem"; // 确认路径，假设 SidebarItem 接受 handleProps
import { selectCollapsedCategories } from "create/space/spaceSlice"; // 确认路径
import { useTheme } from "app/theme"; // 确认路径
import { UNCATEGORIZED_ID } from "create/space/constants"; // 确认路径
import { ItemDraggable } from "chat/ChatSidebar"; // 从 ChatSidebar 导入 ItemDraggable

// --- Props 接口 ---
interface CategorySectionProps {
  categoryId: string; // 分类的唯一 ID (可以是 UNCATEGORIZED_ID)
  categoryName: string; // 分类的显示名称
  items: SpaceContent[]; // 该分类下的内容项列表
  shouldAnimate: boolean; // 是否对内容项应用入场动画
  handleProps?: {
    onDragStart: (e: React.DragEvent) => void;
    onDragEnd: (e: React.DragEvent) => void;
  }; // 拖拽分类排序的句柄 (仅用于真实分类)
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

    // --- Redux Hooks ---
    const collapsedCategories = useAppSelector(selectCollapsedCategories); // 获取所有折叠的分类ID
    // 检查当前分类是否处于折叠状态
    const isCollapsed = collapsedCategories[categoryId] ?? false;

    return (
      <>
        {/* 分类区域的根元素 */}
        <div
          className={`ChatSidebar__category ${isUncategorized ? "ChatSidebar__category--uncategorized" : ""}`}
        >
          {/* 渲染分类头部 */}
          <CategoryHeader
            categoryId={categoryId} // 传递分类 ID
            categoryName={categoryName} // 传递分类名称
            // 仅在不是未分类区域时传递拖拽句柄给 CategoryHeader (用于拖拽分类)
            handleProps={!isUncategorized ? handleProps : undefined}
            isDragOver={false} // 暂时设置为 false，实际应根据拖放状态更新
          />

          {/* 仅在未折叠时渲染分类内容 */}
          {!isCollapsed && (
            <div className="ChatSidebar__category-content">
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
            </div>
          )}
        </div>

        {/* 组件内嵌样式 */}
        <style href="category-section" precedence="medium">{`
          .ChatSidebar__category {
            position: relative; /* 用于 ::after 伪元素定位 */
            transition: background-color 0.2s ease;
            margin-bottom: 4px; /* 分类之间的间距 */
          }

          /* 可选：为未分类区域添加特定样式 */
          /* .ChatSidebar__category--uncategorized { border-top: 1px solid ${theme.border || "#eee"}; margin-top: 8px; padding-top: 4px; } */

          /* 分类内容区域 */
          .ChatSidebar__category-content {
            margin-top: 0; /* 与头部的间距 */
            padding: 0 ;
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
