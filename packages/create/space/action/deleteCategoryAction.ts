import type { SpaceId, SpaceData } from "create/space/types";
import { selectCurrentUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { read, write } from "database/dbSlice";
import { selectCurrentSpaceId } from "../spaceSlice";

/**
 * 删除分类
 *
 * 说明：
 * 1. 当前用户必须为该空间成员，才能进行删除操作；
 * 2. 如果指定的分类不存在，则报错；
 * 3. 删除分类时，同时遍历所有内容（contents），
 *    将所有内容中 categoryId 为被删除分类的项置为空字符串；
 * 4. 更新 updatedAt 字段后写入最新数据。
 */
export const deleteCategoryAction = async (
  input: { spaceId: SpaceId; categoryId: string },
  thunkAPI: any
): Promise<{ spaceId: SpaceId; updatedSpaceData: SpaceData }> => {
  const { categoryId } = input;
  const { dispatch, getState } = thunkAPI;
  const state = getState();
  const currentUserId = selectCurrentUserId(state);
  const spaceId = selectCurrentSpaceId(state);

  const spaceKey = createSpaceKey.space(spaceId);
  const spaceData: SpaceData | null = await dispatch(read(spaceKey)).unwrap();
  if (!spaceData) {
    throw new Error("空间不存在");
  }
  // 检查操作权限：必须为该空间成员
  if (!spaceData.members.includes(currentUserId)) {
    throw new Error("当前用户不是空间成员，无法删除分类");
  }
  // 检查分类是否存在
  if (!spaceData.categories || !spaceData.categories[categoryId]) {
    throw new Error("指定分类不存在");
  }

  // 删除指定的分类
  const newCategories = { ...spaceData.categories };
  delete newCategories[categoryId];

  // 遍历内容，将属于该分类的内容的 categoryId 设置为空字符串
  const newContents = { ...spaceData.contents };
  Object.keys(newContents).forEach((contentKey) => {
    if (newContents[contentKey].categoryId === categoryId) {
      newContents[contentKey] = { ...newContents[contentKey], categoryId: "" };
    }
  });

  const updatedSpaceData: SpaceData = {
    ...spaceData,
    categories: newCategories,
    contents: newContents,
    updatedAt: Date.now(),
  };

  await dispatch(
    write({ data: updatedSpaceData, customKey: spaceKey })
  ).unwrap();
  return { spaceId, updatedSpaceData };
};
