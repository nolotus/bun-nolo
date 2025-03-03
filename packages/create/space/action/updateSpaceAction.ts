import { selectCurrentUserId } from "auth/authSlice";
import { read, patchData } from "database/dbSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { SpaceVisibility } from "create/space/types";

export const updateSpaceAction = async (
  input: {
    spaceId: string;
    name?: string;
    description?: string;
    visibility?: SpaceVisibility;
  },
  thunkAPI
) => {
  const { spaceId, name, description, visibility } = input;
  const dispatch = thunkAPI.dispatch;
  const state = thunkAPI.getState();
  const userId = selectCurrentUserId(state);

  // 获取 space 数据
  const spaceKey = createSpaceKey.space(spaceId);
  const spaceData = await dispatch(read(spaceKey)).unwrap();

  if (!spaceData) {
    throw new Error("Space not found");
  }

  if (!spaceData.members.includes(userId)) {
    throw new Error("User is not a member of this space");
  }

  // 构建增量更新对象
  const changes: any = {};
  if (name !== undefined) changes.name = name;
  if (description !== undefined) changes.description = description;
  if (visibility !== undefined) changes.visibility = visibility;

  // 如果没有变化，直接返回
  if (Object.keys(changes).length === 0) {
    return { updatedSpace: spaceData, spaceId };
  }

  // 使用 patchData 更新空间数据
  const updatedSpaceData = await dispatch(
    patchData({
      dbKey: spaceKey,
      changes,
    })
  ).unwrap();

  // 如果更新了名称，同步更新 space-member 数据
  if (name !== undefined) {
    const memberKey = createSpaceKey.member(userId, spaceId);
    const memberData = await dispatch(read(memberKey)).unwrap();

    if (memberData) {
      await dispatch(
        patchData({
          dbKey: memberKey,
          changes: { spaceName: name },
        })
      ).unwrap();
    }
  }

  return {
    updatedSpace: updatedSpaceData,
    spaceId,
  };
};
