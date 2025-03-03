import type { SpaceId, SpaceData } from "create/space/types";
import { selectCurrentUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { read, patchData } from "database/dbSlice";

export const reorderCategoriesAction = async (
  input: { spaceId: SpaceId; sortedCategoryIds: string[] },
  thunkAPI: any
): Promise<{ spaceId: SpaceId; updatedSpaceData: SpaceData }> => {
  const { spaceId, sortedCategoryIds } = input;
  const { dispatch } = thunkAPI;
  const state = thunkAPI.getState();
  const currentUserId = selectCurrentUserId(state);

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

  const changes = {
    categories: { ...spaceData.categories },
  };
  sortedCategoryIds.forEach((catId, index) => {
    if (changes.categories[catId]) {
      changes.categories[catId] = {
        ...changes.categories[catId],
        order: index,
      };
    }
  });

  const updatedSpaceData = await dispatch(
    patchData({ dbKey: spaceKey, changes })
  ).unwrap();

  return { spaceId, updatedSpaceData };
};
