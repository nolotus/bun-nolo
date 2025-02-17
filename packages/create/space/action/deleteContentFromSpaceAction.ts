import { selectCurrentUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";

import { read, write } from "database/dbSlice";

export const deleteContentFromSpaceAction = async (
  input: { contentKey: string; spaceId: string },
  thunkAPI
) => {
  const { contentKey, spaceId } = input; // 修改默认值为 true
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

  // 创建更新后的 space 数据（移除 content 引用）
  const { [contentKey]: removedContent, ...remainingContents } =
    spaceData.contents;
  const updatedSpaceData = {
    ...spaceData,
    contents: remainingContents,
    updatedAt: Date.now(),
  };

  // 更新 space 数据

  await dispatch(
    write({
      data: updatedSpaceData,
      customKey: spaceKey,
    })
  ).unwrap();

  return {
    contentKey,
    spaceId,
    deletedContent: removedContent,
    updatedSpaceData,
  };
};
