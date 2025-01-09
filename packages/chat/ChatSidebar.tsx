import { useAppSelector } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";
import { DataType } from "create/types";
import { useUserData } from "database/hooks/useUserData";
import { SidebarItem } from "./dialog/SidebarItem";
import { selectByTypes } from "database/dbSlice";

const ChatSidebar = () => {
  const currentUserId = useAppSelector(selectCurrentUserId);
  const targetTypes = [DataType.DIALOG, DataType.PAGE];

  // 只选择需要的类型数据
  const sidebarData = useAppSelector((state) =>
    selectByTypes(state, targetTypes)
  );

  const { loading } = useUserData(targetTypes, currentUserId, 100);

  if (loading) return null;
  if (!sidebarData?.length) return null;

  return (
    <nav>
      {sidebarData.map((item) => (
        <SidebarItem key={item.id} {...item} />
      ))}
    </nav>
  );
};

export default ChatSidebar;
