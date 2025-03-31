import type { SpaceId, SpaceData } from "create/space/types";
import { selectCurrentUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { read, patch } from "database/dbSlice";
import { ulid } from "ulid";
import { selectCurrentSpaceId } from "../spaceSlice";

export const addCategoryAction = async (
  input: { name: string; categoryId?: string; order?: number },
  thunkAPI: any
): Promise<{ spaceId: SpaceId; updatedSpaceData: SpaceData }> => {
  const { name, categoryId, order } = input;
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
    throw new Error("当前用户不是空间成员，无法添加分类");
  }

  const newCategoryId = categoryId || ulid();
  if (spaceData.categories?.[newCategoryId]) {
    throw new Error("该分类已存在");
  }

  const changes = {
    categories: {
      ...(spaceData.categories || {}),
      [newCategoryId]: {
        name,
        order:
          order !== undefined
            ? order
            : Object.keys(spaceData.categories || {}).length,
      },
    },
  };

  const updatedSpaceData = await dispatch(
    patch({ dbKey: spaceKey, changes })
  ).unwrap();

  return { spaceId, updatedSpaceData };
};
