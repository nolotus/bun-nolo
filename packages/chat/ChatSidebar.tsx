import { memo, useState, useEffect, useMemo, useCallback } from "react";
import { useAppSelector } from "app/hooks";
import { selectCurrentSpace } from "create/space/spaceSlice";
import { SpaceContent } from "create/space/types";
import { SidebarItem } from "./dialog/SidebarItem";

// 1. 将样式提取到外部CSS文件或公共样式中
const ANIMATION_STYLES = {
  slideIn: {
    animationName: "slideInLeft",
    animationDuration: "0.2s", // 缩短动画时间
    animationFillMode: "both",
  },
} as const;

// 2. 优化排序函数
const sortByUpdateTime = (a: SpaceContent, b: SpaceContent) => {
  // 使用时间戳比较替代Date对象创建
  const timeA = new Date(a.updatedAt || a.createdAt).getTime();
  const timeB = new Date(b.updatedAt || b.createdAt).getTime();
  return timeB - timeA;
};

// 3. 优化动画组件
const AnimatedItem = memo(
  ({
    item,
    shouldAnimate,
    index,
  }: {
    item: SpaceContent;
    shouldAnimate: boolean;
    index: number;
  }) => (
    <div
      style={
        shouldAnimate
          ? {
              ...ANIMATION_STYLES.slideIn,
              animationDelay: `${index * 0.03}s`, // 减少延迟间隔
            }
          : undefined
      }
    >
      <SidebarItem {...item} />
    </div>
  ),
  // 4. 添加性能优化的比较函数
  (prevProps, nextProps) => {
    return (
      prevProps.shouldAnimate === nextProps.shouldAnimate &&
      prevProps.item.contentKey === nextProps.item.contentKey
    );
  }
);

const ChatSidebar = () => {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // 只需要获取space数据,不需要额外的初始化操作
  const space = useAppSelector(selectCurrentSpace);

  const sidebarDataArray = useMemo(() => {
    if (!space?.contents) return [];
    return Object.values(space.contents).sort(sortByUpdateTime);
  }, [space?.contents]);

  const handleAnimationEnd = useCallback(() => {
    setShouldAnimate(false);
  }, []);

  useEffect(() => {
    if (sidebarDataArray.length) {
      setShouldAnimate(true);
    }
  }, [sidebarDataArray]);

  if (!sidebarDataArray.length) return null;

  return (
    <nav className="chat-sidebar" onAnimationEnd={handleAnimationEnd}>
      {sidebarDataArray.map((item, index) => (
        <AnimatedItem
          key={item.contentKey}
          item={item}
          shouldAnimate={shouldAnimate}
          index={index}
        />
      ))}
    </nav>
  );
};

export default memo(ChatSidebar);
