import type { SpaceId, SpaceData } from "create/space/types";
import { selectCurrentUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { read, patchData } from "database/dbSlice";
import { selectCurrentSpaceId } from "../spaceSlice";

export const deleteCategoryAction = async (
  input: { categoryId: string },
  thunkAPI: any
): Promise<{ spaceId: SpaceId; updatedSpaceData: SpaceData }> => {
  const { categoryId } = input;
  const state = thunkAPI.getState();
  const spaceId = selectCurrentSpaceId(state);
  const { dispatch } = thunkAPI;
  const currentUserId = selectCurrentUserId(state);

  const spaceKey = createSpaceKey.space(spaceId);
  const spaceData: SpaceData | null = await dispatch(read(spaceKey)).unwrap();

  if (!spaceData) {
    throw new Error("空间不存在");
  }

  if (!spaceData.members.includes(currentUserId)) {
    throw new Error("当前用户不是空间成员，无法删除分类");
  }

  if (!spaceData.categories?.[categoryId]) {
    throw new Error("指定分类不存在");
  }

  const changes: any = {
    categories: { ...spaceData.categories, [categoryId]: null },
  };

  if (spaceData.contents) {
    changes.contents = { ...spaceData.contents };
    Object.keys(changes.contents).forEach((contentKey) => {
      if (changes.contents[contentKey].categoryId === categoryId) {
        changes.contents[contentKey] = {
          ...changes.contents[contentKey],
          categoryId: "",
        };
      }
    });
  }

  const updatedSpaceData = await dispatch(
    patchData({ dbKey: spaceKey, changes })
  ).unwrap();

  return { spaceId, updatedSpaceData };
};
