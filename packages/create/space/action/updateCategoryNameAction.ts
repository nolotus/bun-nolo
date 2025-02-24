import type { SpaceId, SpaceData } from "create/space/types";
import { selectCurrentUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { read, write } from "database/dbSlice";

/**
 * 修改分类名称
 *
 * 说明：
 * 1. 当前用户必须为该空间成员，才能进行修改操作；
 * 2. 如果指定的分类不存在，则立即报错；
 * 3. 更新分类的 name 属性，同时更新 updatedAt 字段；
 * 4. 写入更新后的空间数据，并返回最新的数据对象。
 */
export const updateCategoryNameAction = async (
  input: { spaceId: SpaceId; categoryId: string; name: string },
  thunkAPI: any
): Promise<{ spaceId: SpaceId; updatedSpaceData: SpaceData }> => {
  const { spaceId, categoryId, name } = input;
  const { dispatch, getState } = thunkAPI;
  const state = getState();
  const currentUserId = selectCurrentUserId(state);

  const spaceKey = createSpaceKey.space(spaceId);
  const spaceData: SpaceData | null = await dispatch(read(spaceKey)).unwrap();

  if (!spaceData) {
    throw new Error("空间不存在");
  }
  // 检查操作权限：只有空间成员才能修改分类名称
  if (!spaceData.members.includes(currentUserId)) {
    throw new Error("当前用户不是空间成员，无法修改分类名称");
  }
  // 检查指定的分类是否存在
  if (!spaceData.categories || !spaceData.categories[categoryId]) {
    throw new Error("指定的分类不存在");
  }

  // 更新指定分类的名称
  const newCategories = {
    ...spaceData.categories,
    [categoryId]: {
      ...spaceData.categories[categoryId],
      name,
    },
  };

  const updatedSpaceData: SpaceData = {
    ...spaceData,
    categories: newCategories,
    updatedAt: Date.now(),
  };

  await dispatch(
    write({ data: updatedSpaceData, customKey: spaceKey })
  ).unwrap();
  return { spaceId, updatedSpaceData };
};
