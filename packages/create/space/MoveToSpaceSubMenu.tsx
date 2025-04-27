import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";
import {
  selectAllMemberSpaces,
  selectCurrentSpaceId,
} from "create/space/spaceSlice";
import { moveContentToSpace } from "create/space/spaceSlice"; // 确保导入正确的 action

interface MoveToSpaceSubMenuProps {
  position: { top: number; left: number };
  contentKey: string; // 需要移动的内容的 key
  onClose: () => void; // 关闭菜单的回调
}

const MoveToSpaceSubMenu: React.FC<MoveToSpaceSubMenuProps> = ({
  position,
  contentKey,
  onClose,
}) => {
  const theme = useSelector(selectTheme);
  const dispatch = useDispatch();
  const memberSpaces = useSelector(selectAllMemberSpaces); // 获取用户加入的所有空间
  const currentSpaceId = useSelector(selectCurrentSpaceId); // 获取当前空间ID

  // 处理选择某个空间
  const handleSpaceSelect =
    (targetSpaceId: string) => async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!currentSpaceId) {
        console.error("当前空间ID未定义，无法移动内容");
        return;
      }
      if (currentSpaceId === targetSpaceId) {
        console.log("目标空间与当前空间相同，无需移动");
        onClose();
        return;
      }

      try {
        console.log(
          `移动内容 ${contentKey} 从空间 ${currentSpaceId} 到空间 ${targetSpaceId}`
        );
        // 调用 action 进行内容移动
        await dispatch(
          moveContentToSpace({
            contentKey,
            sourceSpaceId: currentSpaceId,
            targetSpaceId,
            targetCategoryId: undefined, // 可选，默认为未分类
          })
        ).unwrap();
        console.log("内容移动成功");
      } catch (error) {
        console.error("内容移动失败:", error);
      } finally {
        onClose(); // 无论成功与否，关闭菜单
      }
    };

  return (
    <div
      className="SidebarItem__subMenu"
      role="menu"
      style={{
        position: "absolute",
        top: `${position.top}px`,
        left: `${position.left}px`,
        backgroundColor: theme.backgroundElevated || theme.background,
        border: `1px solid ${theme.border}`,
        borderRadius: "6px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        padding: "4px",
        zIndex: 1001, // 确保子菜单在主菜单之上
        minWidth: "120px",
        animation: "fadeIn 0.15s ease-out",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {memberSpaces.length > 0 ? (
        memberSpaces
          .filter((space) => space.spaceId !== currentSpaceId) // 过滤掉当前空间
          .map((space) => (
            <button
              key={space.spaceId}
              className="SidebarItem__menuItem"
              onClick={handleSpaceSelect(space.spaceId)}
              role="menuitem"
            >
              {space.spaceName || space.spaceId}
            </button>
          ))
      ) : (
        <div
          style={{
            padding: "8px 12px",
            fontSize: "13px",
            color: theme.textSecondary,
            textAlign: "center",
          }}
        >
          无可用空间
        </div>
      )}
    </div>
  );
};

MoveToSpaceSubMenu.displayName = "MoveToSpaceSubMenu";
export default MoveToSpaceSubMenu;
