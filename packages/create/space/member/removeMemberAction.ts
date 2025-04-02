import type { SpaceId, SpaceData } from "create/space/types";
import { selectCurrentUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { read, write, remove } from "database/dbSlice"; // 使用 remove

/**
 * 从空间中删除成员
 *
 * 说明：
 * 1. 当前用户必须是该空间的 owner，才能进行删除操作；
 * 2. 待删除的成员必须存在于空间中，否则直接报错；
 * 3. 更新 SpaceData.members 数组，删除对应的 SpaceMemberWithSpaceInfo 数据，并更新 updatedAt 字段。
 */
export const removeMemberAction = async (
  input: { spaceId: SpaceId; memberId: string },
  thunkAPI: any
): Promise<{ spaceId: SpaceId; updatedSpaceData: SpaceData }> => {
  const { spaceId, memberId } = input;
  const { dispatch, getState } = thunkAPI;
  const state = getState();
  const currentUserId = selectCurrentUserId(state);

  const spaceKey = createSpaceKey.space(spaceId);
  const spaceData: SpaceData | null = await dispatch(read(spaceKey)).unwrap();

  if (!spaceData) {
    throw new Error("Space not found");
  }

  // 检查当前用户是否是 owner
  if (spaceData.ownerId !== currentUserId) {
    throw new Error("只有空间所有者才能删除成员");
  }

  // 检查待删除的成员是否存在
  if (!spaceData.members.includes(memberId)) {
    throw new Error("待删除的成员不存在");
  }

  // 更新 SpaceData，移除成员
  const updatedSpaceData: SpaceData = {
    ...spaceData,
    members: spaceData.members.filter((id) => id !== memberId),
    updatedAt: Date.now(),
  };

  // 删除对应的 SpaceMemberWithSpaceInfo 数据
  const memberKey = createSpaceKey.member(memberId, spaceId);
  await Promise.all([
    dispatch(write({ data: updatedSpaceData, customKey: spaceKey })).unwrap(),
    dispatch(remove(memberKey)).unwrap(), // 使用 remove 替代 del
  ]);

  return { spaceId, updatedSpaceData };
};
