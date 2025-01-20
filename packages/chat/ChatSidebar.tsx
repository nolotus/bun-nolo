import { useAppSelector } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";
import { DataType } from "create/types";
import { useUserData } from "database/hooks/useUserData";
import { SidebarItem } from "./dialog/SidebarItem";
import { selectByTypes } from "database/dbSlice";
import { useState, useEffect, useRef } from "react";
import { compareDesc } from "date-fns";

const ChatSidebar = () => {
  const currentUserId = useAppSelector(selectCurrentUserId);
  const targetTypes = [DataType.DIALOG, DataType.PAGE];

  const sidebarData = useAppSelector((state) =>
    selectByTypes(state, targetTypes, currentUserId)
  );

  const firstRenderRef = useRef(true);
  const previousDataRef = useRef<typeof sidebarData>([]);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const { data } = useUserData(targetTypes, currentUserId, 100);

  useEffect(() => {
    // 首次渲染不执行动画
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }

    // 只在数据真正变化时触发动画
    if (
      sidebarData?.length &&
      JSON.stringify(previousDataRef.current) !== JSON.stringify(sidebarData)
    ) {
      previousDataRef.current = sidebarData;
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
      <nav>
        {sidebarData
          .sort((a, b) => {
            const dateA = new Date(a.updatedAt || a.createdAt);
            const dateB = new Date(b.updatedAt || b.createdAt);
            return compareDesc(dateA, dateB);
          })
          .map((item, index) => (
            <div
              key={item.id}
              style={{
                animation: shouldAnimate
                  ? `slideInLeft 0.3s ease-out ${index * 0.05}s both`
                  : "none",
              }}
            >
              <SidebarItem {...item} />
            </div>
          ))}
      </nav>
    </>
  );
};

export default ChatSidebar;
