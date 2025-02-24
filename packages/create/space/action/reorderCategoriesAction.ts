import type { SpaceId, SpaceData } from "create/space/types";
import { selectCurrentUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { read, write } from "database/dbSlice";

/**
 * 根据传入的排序数组更新空间中各分类的 order 值
 *
 * 说明：
 * 1. 当前用户必须是该空间的成员，才具备操作权限；
 * 2. 传入 sortedCategoryIds 是一个按期望顺序排列的分类 ID 数组，
 *    将依次更新每个分类的 order 值为其在数组中的索引；
 * 3. 如果当前空间不存在分类，则直接报错；
 * 4. 更新后同步修改 updatedAt 字段，并返回更新后的空间数据。
 */
export const reorderCategoriesAction = async (
  input: { spaceId: SpaceId; sortedCategoryIds: string[] },
  thunkAPI: any
): Promise<{ spaceId: SpaceId; updatedSpaceData: SpaceData }> => {
  const { spaceId, sortedCategoryIds } = input;
  const { dispatch, getState } = thunkAPI;
  const currentUserId = selectCurrentUserId(getState());

  const spaceKey = createSpaceKey.space(spaceId);
  const spaceData: SpaceData | null = await dispatch(read(spaceKey)).unwrap();
  if (!spaceData) {
    throw new Error("空间不存在");
  }
  if (!spaceData.members.includes(currentUserId)) {
    throw new Error("当前用户不是空间成员，无法进行分类排序");
  }
  if (!spaceData.categories) {
    throw new Error("当前空间没有分类可排序");
  }

  // 复制现有的分类对象，根据传入的顺序更新各分类的 order 值
  const newCategories = { ...spaceData.categories };
  sortedCategoryIds.forEach((catId, index) => {
    if (newCategories[catId]) {
      newCategories[catId] = {
        ...newCategories[catId],
        order: index,
      };
    }
  });

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
