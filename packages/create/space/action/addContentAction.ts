import { AddContentRequest, SpaceId, SpaceContent } from "create/space/types";
import { selectCurrentUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { patchData, read } from "database/dbSlice";

export const addContentAction = async (
  input: AddContentRequest & { spaceId: SpaceId },
  thunkAPI
) => {
  const {
    spaceId,
    title,
    type,
    contentKey,
    categoryId,
    pinned = false,
  } = input;

  const dispatch = thunkAPI.dispatch;
  const state = thunkAPI.getState();
  const userId = selectCurrentUserId(state);

  // 获取space数据
  const spaceKey = createSpaceKey.space(spaceId);
  const spaceData = await dispatch(read(spaceKey)).unwrap();

  if (!spaceData) {
    throw new Error("Space not found");
  }

  if (!spaceData.members.includes(userId)) {
    throw new Error("User is not a member of this space");
  }

  // 创建content引用
  const spaceContent: SpaceContent = {
    title,
    type,
    contentKey,
    categoryId: categoryId || "",
    pinned,
    createdAt: Date.now(),
    updatedAt: Date.now(), // 初始设置，后续由 patchAction 统一更新
  };

  // 准备增量更新
  const changes = {
    contents: {
      [contentKey]: spaceContent,
    },
  };

  // 写入更新后的space数据
  const updatedSpaceData = await dispatch(
    patchData({
      dbKey: spaceKey,
      changes,
    })
  ).unwrap();

  return { spaceId, updatedSpaceData };
};
