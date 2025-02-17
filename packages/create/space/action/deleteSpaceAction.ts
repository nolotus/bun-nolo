import { selectCurrentUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";

import { read, remove } from "database/dbSlice";

export const deleteSpaceAction = async (spaceId: string, thunkAPI) => {
  const dispatch = thunkAPI.dispatch;
  const state = thunkAPI.getState();
  const userId = selectCurrentUserId(state);

  // 获取space数据用于权限检查
  const spaceKey = createSpaceKey.space(spaceId);
  const spaceData = await dispatch(read(spaceKey)).unwrap();

  if (!spaceData) {
    throw new Error("Space not found");
  }

  if (spaceData.ownerId !== userId) {
    throw new Error("Only owner can delete space");
  }

  // 删除space数据
  await dispatch(remove(spaceKey)).unwrap();

  // 删除所有成员的space-member数据
  for (const memberId of spaceData.members) {
    const memberKey = createSpaceKey.member(memberId, spaceId);
    await dispatch(remove(memberKey)).unwrap();
  }
  return {
    spaceId,
  };
};
