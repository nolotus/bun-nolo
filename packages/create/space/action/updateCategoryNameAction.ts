import type { SpaceId, SpaceData } from "create/space/types";
import { selectCurrentUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { read, patchData } from "database/dbSlice";

export const updateCategoryNameAction = async (
  input: { spaceId: SpaceId; categoryId: string; name: string },
  thunkAPI: any
): Promise<{ spaceId: SpaceId; updatedSpaceData: SpaceData }> => {
  const { spaceId, categoryId, name } = input;
  const { dispatch } = thunkAPI;
  const state = thunkAPI.getState();
  const currentUserId = selectCurrentUserId(state);

  const spaceKey = createSpaceKey.space(spaceId);
  const spaceData: SpaceData | null = await dispatch(read(spaceKey)).unwrap();

  if (!spaceData) {
    throw new Error("空间不存在");
  }

  if (!spaceData.members.includes(currentUserId)) {
    throw new Error("当前用户不是空间成员，无法修改分类名称");
  }

  if (!spaceData.categories?.[categoryId]) {
    throw new Error("指定的分类不存在");
  }

  const changes = {
    categories: {
      [categoryId]: {
        ...spaceData.categories[categoryId],
        name,
      },
    },
  };

  const updatedSpaceData = await dispatch(
    patchData({ dbKey: spaceKey, changes })
  ).unwrap();

  return { spaceId, updatedSpaceData };
};
