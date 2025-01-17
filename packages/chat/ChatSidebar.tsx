import { useAppSelector } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";
import { DataType } from "create/types";
import { useUserData } from "database/hooks/useUserData";
import { SidebarItem } from "./dialog/SidebarItem";
import { selectByTypes } from "database/dbSlice";

const ChatSidebar = () => {
  const currentUserId = useAppSelector(selectCurrentUserId);
  const targetTypes = [DataType.DIALOG, DataType.PAGE];

  // 按类型和用户ID筛选数据
  const sidebarData = useAppSelector((state) =>
    selectByTypes(state, targetTypes, currentUserId)
  );

  const { loading } = useUserData(targetTypes, currentUserId, 100);

  // 添加日志记录数据加载状态
  console.log("[ChatSidebar] Data:", {
    loading,
    itemCount: sidebarData?.length,
    userId: currentUserId,
  });

  if (loading) return null;
  if (!sidebarData?.length) return null;

  return (
    <nav>
      {sidebarData
        .sort((a, b) => {
          // 优先使用 updatedAt，如果没有则使用 createdAt
          const dateA = new Date(a.updatedAt || a.createdAt);
          const dateB = new Date(b.updatedAt || b.createdAt);
          return dateB.getTime() - dateA.getTime();
        })
        .map((item) => (
          <SidebarItem key={item.id} {...item} />
        ))}
    </nav>
  );
};

export default ChatSidebar;
