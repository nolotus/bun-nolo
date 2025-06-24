// 文件路径: "create/space/category/CategorySection"
import React, { memo, useState, useRef, useEffect } from "react";
import { useAppSelector } from "app/hooks";
import { SpaceContent } from "app/types";
import CategoryHeader from "create/space/category/CategoryHeader";
import SidebarItem from "create/space/SidebarItem";
import { selectCollapsedCategories } from "create/space/spaceSlice";
import { useTheme } from "app/theme";
import { UNCATEGORIZED_ID } from "create/space/constants";

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

const CategorySection: React.FC<CategorySectionProps> = memo(
  ({ categoryId, categoryName, items = [], shouldAnimate, handleProps }) => {
    const theme = useTheme();
    const contentRef = useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = useState<number | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const isUncategorized = categoryId === UNCATEGORIZED_ID;
    const collapsedCategories = useAppSelector(selectCollapsedCategories);
    const isCollapsed = collapsedCategories[categoryId] ?? false;

    useEffect(() => {
      const updateHeight = () => {
        if (contentRef.current) {
          contentRef.current.style.height = "auto";
          const scrollHeight = contentRef.current.scrollHeight;
          // 当没有项目时，给一个固定的高度，例如 28px (CategorySection 的高度通常是 28px 左右)
          // 否则，使用实际滚动高度
          const height = items.length === 0 ? 28 : scrollHeight;
          setContentHeight(height);
        }
      };

      updateHeight();
      // 在一些特殊情况下，比如图片加载完成后内容高度可能会变化，可以加一个小的延时再次更新高度。
      // 但对于纯文本内容，首次更新通常足够。为了确保动画平滑，保留这个 timer 是一种保险措施。
      const timer = setTimeout(updateHeight, 500);

      if (contentRef.current) {
        const resizeObserver = new ResizeObserver(updateHeight);
        resizeObserver.observe(contentRef.current);
        return () => {
          resizeObserver.disconnect();
          clearTimeout(timer);
        };
      }
      return () => clearTimeout(timer);
    }, [items.length, isCollapsed]); // 依赖项：items.length 变化时更新高度，isCollapsed 变化时重新计算高度

    useEffect(() => {
      if (contentHeight !== null) {
        setIsAnimating(true);
        const timer = setTimeout(() => setIsAnimating(false), 280); // 280ms 匹配 transition 动画时间
        return () => clearTimeout(timer);
      }
    }, [isCollapsed, contentHeight]); // contentHeight 变化（意味着高度计算完成）或 isCollapsed 变化时触发动画状态

    return (
      <>
        <div
          className={[
            "ChatSidebar__category",
            isUncategorized && "ChatSidebar__category--uncategorized",
            isAnimating && "ChatSidebar__category--animating", // 动画进行中
            items.length === 0 && "ChatSidebar__category--empty", // 空分类状态
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <CategoryHeader
            categoryId={categoryId}
            categoryName={categoryName}
            handleProps={!isUncategorized ? handleProps : undefined}
            isDragOver={false} // CategoryHeader 内部可能需要知道拖拽状态，这里暂时保持 false
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
                  : "auto", // 使用计算出的高度
                "--items-count": items.length, // 用于 CSS 动画延迟计算
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
                    <SidebarItem {...item} animate={shouldAnimate} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <style jsx>{`
          .ChatSidebar__category {
            position: relative;
            margin-bottom: ${theme.space[1]};
            border-radius: ${theme.space[2]};
            transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
            overflow: hidden;
          }

          .ChatSidebar__category-content {
            overflow: hidden;
            height: var(--content-height);
            transition:
              height 0.28s cubic-bezier(0.25, 0.8, 0.25, 1),
              opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            opacity: 1;
            will-change: height, opacity;
          }

          .ChatSidebar__category-content--collapsed {
            height: 0 !important;
            opacity: 0;
            transition:
              height 0.28s cubic-bezier(0.25, 0.8, 0.25, 1),
              opacity 0.15s cubic-bezier(0.4, 0, 1, 1);
          }

          .ChatSidebar__category-inner {
            padding-top: ${theme.space[1]};
            min-height: 0;
            transform: translateZ(0); /* 提升 GPU 渲染 */
          }

          .ChatSidebar__item-wrapper {
            transform: translateY(0);
            opacity: 1;
            transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
            transition-delay: calc(var(--item-index, 0) * 0.03s);
            margin: 0;
            will-change: transform, opacity;
          }

          .ChatSidebar__category-content--collapsed .ChatSidebar__item-wrapper {
            transform: translateY(-8px);
            opacity: 0;
            transition-delay: calc(
              (var(--total-items, 1) - var(--item-index, 0) - 1) * 0.02s
            );
          }

          .ChatSidebar__empty-category-hint {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 28px; /* 适配计算的高度 */
            margin: ${theme.space[1]} 0;
            border: 1px dashed ${theme.borderLight};
            border-radius: ${theme.space[2]};
            background: ${theme.backgroundGhost};
            transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
            flex-shrink: 0; /* 防止被压缩 */
          }

          .ChatSidebar__empty-category-text {
            color: ${theme.textQuaternary};
            font-size: 0.75rem;
            opacity: 0.7;
          }

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
