// components/chat/ChatSidebar.tsx
import { memo, useState, useEffect, useRef } from "react";
import { useAppSelector } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";
import { DataType } from "create/types";
import { useUserData } from "database/hooks/useUserData";
import { SidebarItem } from "./dialog/SidebarItem";
import { selectByTypes } from "database/dbSlice";
import { compareDesc } from "date-fns";

// 提取排序逻辑
const sortByUpdateTime = (a: any, b: any) => {
  const dateA = new Date(a.updatedAt || a.createdAt);
  const dateB = new Date(b.updatedAt || b.createdAt);
  return compareDesc(dateA, dateB);
};

// 提取动画样式组件
const AnimatedItem = memo(
  ({
    item,
    shouldAnimate,
    index,
  }: {
    item: any;
    shouldAnimate: boolean;
    index: number;
  }) => (
    <div
      className={shouldAnimate ? "animate-slide-in" : undefined}
      style={
        shouldAnimate
          ? {
              animationDelay: `${index * 0.05}s`,
              animationDuration: "0.3s",
            }
          : undefined
      }
    >
      <SidebarItem {...item} />
    </div>
  )
);

AnimatedItem.displayName = "AnimatedItem";

const ChatSidebar = () => {
  const currentUserId = useAppSelector(selectCurrentUserId);
  const targetTypes = [DataType.DIALOG, DataType.PAGE];
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const sidebarData = useAppSelector((state) =>
    selectByTypes(state, targetTypes, currentUserId)
  );

  const firstRenderRef = useRef(true);
  const previousDataRef = useRef<string>("");

  // 使用useUserData加载远程数据
  useUserData(targetTypes, currentUserId, 100);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    const currentDataString = JSON.stringify(sidebarData);
    if (sidebarData?.length && previousDataRef.current !== currentDataString) {
      previousDataRef.current = currentDataString;
      setShouldAnimate(true);

      const timer = setTimeout(() => {
        setShouldAnimate(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [sidebarData]);

  if (!sidebarData?.length) return null;

  return (
    <>
      <style>
        {`
          .animate-slide-in {
            animation: slideInLeft both;
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
      <nav className="chat-sidebar">
        {sidebarData.sort(sortByUpdateTime).map((item, index) => (
          <AnimatedItem
            key={item.id}
            item={item}
            shouldAnimate={shouldAnimate}
            index={index}
          />
        ))}
      </nav>
    </>
  );
};

export default memo(ChatSidebar);
