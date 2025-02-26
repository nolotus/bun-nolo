// create/space/action/updateContentCategoryAction.ts

import { SpaceId, SpaceData } from "create/space/types";
import { selectCurrentUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { read, write } from "database/dbSlice";

interface UpdateContentCategoryRequest {
  spaceId: SpaceId;
  contentKey: string;
  categoryId: string | null;
}

export const updateContentCategoryAction = async (
  input: UpdateContentCategoryRequest,
  thunkAPI
) => {
  const { spaceId, contentKey, categoryId } = input;

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

  // 验证内容是否存在
  if (!spaceData.contents?.[contentKey]) {
    throw new Error("Content not found");
  }

  // 如果指定了分类ID，验证分类是否存在
  if (categoryId && !spaceData.categories?.[categoryId]) {
    throw new Error("Category not found");
  }

  // 更新内容的分类
  const updatedContent = {
    ...spaceData.contents[contentKey],
    categoryId: categoryId || "",
    updatedAt: Date.now(),
  };

  // 更新space数据
  const updatedSpaceData = {
    ...spaceData,
    contents: {
      ...spaceData.contents,
      [contentKey]: updatedContent,
    },
    updatedAt: Date.now(),
  };

  // 写入更新后的space数据
  await dispatch(
    write({
      data: updatedSpaceData,
      customKey: spaceKey,
    })
  ).unwrap();

  return { spaceId, updatedSpaceData };
};
