import type { SpaceId } from "create/space/types";
import type { SpaceData } from "app/types";
import { selectUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { read } from "database/dbSlice";

/**
 * 校验当前用户是否为目标空间的成员，并返回空间数据、当前用户ID和空间键。
 *
 * @param spaceId - 空间 ID
 * @param thunkAPI - thunk API 对象，包含 dispatch 和 getState
 * @returns 包含 spaceData、currentUserId 和 spaceKey
 * @throws 如果没有找到空间或当前用户不在空间的成员列表中，将抛出异常
 */
export const validateSpacePermission = async (
  spaceId: SpaceId,
  thunkAPI: any
): Promise<{
  spaceData: SpaceData;
  currentUserId: string;
  spaceKey: string;
}> => {
  const { dispatch, getState } = thunkAPI;
  const state = getState();
  const currentUserId = selectUserId(state);
  const spaceKey = createSpaceKey.space(spaceId);
  const spaceData: SpaceData | null = await dispatch(read(spaceKey)).unwrap();

  if (!spaceData) {
    throw new Error("空间不存在");
  }
  if (!spaceData.members.includes(currentUserId)) {
    throw new Error("当前用户不是空间成员，无法执行该操作");
  }
  return { spaceData, currentUserId, spaceKey };
};
