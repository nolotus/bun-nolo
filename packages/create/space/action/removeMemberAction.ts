import type { SpaceId, SpaceData } from "create/space/types";
import { selectCurrentUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { read, write } from "database/dbSlice";

/**
 * 删除成员从空间中
 *
 * 说明：
 * 1. 当前用户必须是该空间的成员，才能进行删除操作；
 * 2. 待删除的成员必须存在于空间中，否则直接报错；
 * 3. 更新完成后，将修改 SpaceData.members 数组以及更新 updatedAt 字段。
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
  // 当前用户必须已经是空间的成员才能操作
  if (!spaceData.members.includes(currentUserId)) {
    throw new Error("当前用户不是空间成员，无法删除成员");
  }
  if (!spaceData.members.includes(memberId)) {
    throw new Error("待删除的成员不存在");
  }

  const updatedSpaceData: SpaceData = {
    ...spaceData,
    members: spaceData.members.filter((id) => id !== memberId),
    updatedAt: Date.now(),
  };

  await dispatch(
    write({ data: updatedSpaceData, customKey: spaceKey })
  ).unwrap();
  return { spaceId, updatedSpaceData };
};
