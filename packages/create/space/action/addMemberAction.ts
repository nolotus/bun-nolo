import type { SpaceId, SpaceData } from "create/space/types";
import { MemberRole } from "create/space/types";
import { selectCurrentUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { read, write } from "database/dbSlice";

/**
 * 添加成员到空间
 *
 * 说明：
 * 1. 当前用户必须为空间现有成员，才可以添加新成员；
 * 2. 如果成员已存在则直接报错；
 * 3. 这里仅更新 SpaceData.members（成员ID 数组），如果需要记录更多信息（例如角色），
 *    可进一步扩展数据结构或同步写入专门的成员信息表。
 */
export const addMemberAction = async (
  input: { spaceId: SpaceId; memberId: string; role?: MemberRole },
  thunkAPI: any
): Promise<{ spaceId: SpaceId; updatedSpaceData: SpaceData }> => {
  const { spaceId, memberId, role = MemberRole.MEMBER } = input;
  const { dispatch, getState } = thunkAPI;
  const state = getState();
  const currentUserId = selectCurrentUserId(state);

  const spaceKey = createSpaceKey.space(spaceId);
  const spaceData: SpaceData | null = await dispatch(read(spaceKey)).unwrap();

  if (!spaceData) {
    throw new Error("Space not found");
  }
  // 检查当前用户是否为该空间的成员
  if (!spaceData.members.includes(currentUserId)) {
    throw new Error("当前用户不是空间成员，无法添加成员");
  }
  // 检查待添加的成员是否已存在
  if (spaceData.members.includes(memberId)) {
    throw new Error("成员已存在");
  }

  const updatedSpaceData: SpaceData = {
    ...spaceData,
    members: [...spaceData.members, memberId],
    updatedAt: Date.now(),
  };

  await dispatch(
    write({ data: updatedSpaceData, customKey: spaceKey })
  ).unwrap();
  return { spaceId, updatedSpaceData };
};
