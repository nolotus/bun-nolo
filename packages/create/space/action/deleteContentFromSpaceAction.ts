import { selectCurrentUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { patchData, read } from "database/dbSlice";

export const deleteContentFromSpaceAction = async (
  input: { contentKey: string; spaceId: string },
  thunkAPI
) => {
  const { contentKey, spaceId } = input;
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

  // 检查 content 是否存在于 space 中
  if (!spaceData.contents[contentKey]) {
    throw new Error("Content not found in space");
  }

  // 保存被删除的内容以返回
  const removedContent = spaceData.contents[contentKey];

  // 准备增量更新：删除指定 contentKey
  const changes = {
    contents: {
      [contentKey]: null, // 使用 null 表示删除该键
    },
  };

  // 更新 space 数据
  const updatedSpaceData = await dispatch(
    patchData({
      dbKey: spaceKey,
      changes,
    })
  ).unwrap();

  return {
    contentKey,
    spaceId,
    deletedContent: removedContent,
    updatedSpaceData,
  };
};
