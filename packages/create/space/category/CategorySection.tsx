// 文件路径: src/components/sidebar/CategorySection.tsx
import React, { memo, useState, useRef, useEffect } from "react";
import { useAppSelector } from "app/hooks";
import { SpaceContent } from "create/space/types";
import CategoryHeader from "create/space/category/CategoryHeader";
import SidebarItem from "create/space/SidebarItem";
import { selectCollapsedCategories } from "create/space/spaceSlice";
import { useTheme } from "app/theme";
import { UNCATEGORIZED_ID } from "create/space/constants";
import { ItemDraggable } from "chat/ChatSidebar";

interface CategorySectionProps {
  categoryId: string;
  categoryName: string;
  items: SpaceContent[];
  shouldAnimate: boolean;
  handleProps?: {
    onDragStart: (e: React.DragEvent) => void;
    onDragEnd: (e: React.DragEvent) => void;
  };
}

// 优化后的 CategorySection 组件片段
const CategorySection: React.FC<CategorySectionProps> = memo(
  ({ categoryId, categoryName, items = [], shouldAnimate, handleProps }) => {
    const theme = useTheme();
    const contentRef = useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = useState<number | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const isUncategorized = categoryId === UNCATEGORIZED_ID;
    const collapsedCategories = useAppSelector(selectCollapsedCategories);
    const isCollapsed = collapsedCategories[categoryId] ?? false;

    // 修复：即时重新计算高度，避免拖拽空隙
    useEffect(() => {
      const updateHeight = () => {
        if (contentRef.current) {
          const height = Math.max(
            contentRef.current.scrollHeight,
            items.length === 0 ? 32 : 0
          );
          setContentHeight(height);
        }
      };

      updateHeight();

      // 使用 ResizeObserver 监听内容变化
      if (contentRef.current) {
        const resizeObserver = new ResizeObserver(updateHeight);
        resizeObserver.observe(contentRef.current);
        return () => resizeObserver.disconnect();
      }
    }, [items.length, isCollapsed]); // 依赖 items.length 而非整个 items 数组

    // 动画控制
    useEffect(() => {
      if (contentHeight !== null) {
        setIsAnimating(true);
        const timer = setTimeout(() => setIsAnimating(false), 280);
        return () => clearTimeout(timer);
      }
    }, [isCollapsed, contentHeight]);

    return (
      <>
        <div
          className={[
            "ChatSidebar__category",
            isUncategorized && "ChatSidebar__category--uncategorized",
            isAnimating && "ChatSidebar__category--animating",
            items.length === 0 && "ChatSidebar__category--empty",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <CategoryHeader
            categoryId={categoryId}
            categoryName={categoryName}
            handleProps={!isUncategorized ? handleProps : undefined}
            isDragOver={false}
          />

          <div
            ref={contentRef}
            className={`ChatSidebar__category-content ${
              isCollapsed ? "ChatSidebar__category-content--collapsed" : ""
            }`}
            style={
              {
                "--content-height": contentHeight
                  ? `${contentHeight}px`
                  : "auto",
                "--items-count": items.length,
              } as React.CSSProperties
            }
          >
            <div className="ChatSidebar__category-inner">
              {items.length === 0 ? (
                <div className="ChatSidebar__empty-category-hint">
                  <span className="ChatSidebar__empty-category-text">
                    {isCollapsed ? "" : "拖拽内容到此分类"}
                  </span>
                </div>
              ) : (
                // 使用 React.Suspense 优化长列表渲染
                items.map((item, index) => (
                  <div
                    key={item.contentKey}
                    className="ChatSidebar__item-wrapper"
                    style={
                      {
                        "--item-index": index,
                        "--total-items": items.length,
                      } as React.CSSProperties
                    }
                  >
                    <ItemDraggable
                      id={item.contentKey}
                      containerId={categoryId}
                      animate={shouldAnimate}
                    >
                      {(itemHandleProps) => (
                        <SidebarItem {...item} handleProps={itemHandleProps} />
                      )}
                    </ItemDraggable>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 优化后的样式 */}
        <style href="category-section" precedence="medium">{`
          .ChatSidebar__category {
            position: relative;
            margin-bottom: ${theme.space[1]};
            border-radius: ${theme.space[2]};
            transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
            overflow: hidden; /* 防止内容溢出 */
          }

          .ChatSidebar__category-content {
            overflow: hidden;
            height: var(--content-height);
            transition: height 0.28s cubic-bezier(0.25, 0.8, 0.25, 1),
                        opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            opacity: 1;
            will-change: height, opacity; /* 优化动画性能 */
          }

          .ChatSidebar__category-content--collapsed {
            height: 0 !important;
            opacity: 0;
            transition: height 0.28s cubic-bezier(0.25, 0.8, 0.25, 1),
                        opacity 0.15s cubic-bezier(0.4, 0, 1, 1);
          }

          .ChatSidebar__category-inner {
            padding-top: ${theme.space[1]};
            min-height: calc(var(--items-count, 0) * 0px + ${items.length === 0 ? "32px" : "0px"});
            transform: translateZ(0); /* 开启硬件加速 */
          }

          /* 项目包装器 - 修复空隙问题 */
          .ChatSidebar__item-wrapper {
            transform: translateY(0);
            opacity: 1;
            transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
            transition-delay: calc(var(--item-index, 0) * 0.03s);
            margin: 0; /* 移除可能造成空隙的 margin */
            will-change: transform, opacity;
          }

          .ChatSidebar__category-content--collapsed .ChatSidebar__item-wrapper {
            transform: translateY(-8px);
            opacity: 0;
            transition-delay: calc((var(--total-items, 1) - var(--item-index, 0) - 1) * 0.02s);
          }

          /* 空分类提示优化 */
          .ChatSidebar__empty-category-hint {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 28px;
            margin: ${theme.space[1]} 0;
            border: 1px dashed ${theme.borderLight};
            border-radius: ${theme.space[2]};
            background: ${theme.backgroundGhost};
            transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
            flex-shrink: 0; /* 防止高度塌陷 */
          }

          .ChatSidebar__empty-category-text {
            font-size: 0.75rem;
            color: ${theme.textQuaternary};
            opacity: 0;
            transition: opacity 0.25s ease;
          }

          .ChatSidebar__category:hover .ChatSidebar__empty-category-text {
            opacity: 0.6;
          }

          /* 减少动画的媒体查询 */
          @media (prefers-reduced-motion: reduce) {
            .ChatSidebar__category,
            .ChatSidebar__category-content,
            .ChatSidebar__item-wrapper {
              transition-duration: 0.1s !important;
            }
          }
        `}</style>
      </>
    );
  }
);

CategorySection.displayName = "CategorySection";

export default CategorySection;
