import { SpaceId, SpaceData } from "create/space/types";
import { selectCurrentUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { read, patch } from "database/dbSlice";

export const updateContentCategoryAction = async (
  input: { spaceId: SpaceId; contentKey: string; categoryId: string | null },
  thunkAPI: any
): Promise<{ spaceId: SpaceId; updatedSpaceData: SpaceData }> => {
  const { spaceId, contentKey, categoryId } = input;
  const { dispatch } = thunkAPI;
  const state = thunkAPI.getState();
  const userId = selectCurrentUserId(state);

  const spaceKey = createSpaceKey.space(spaceId);
  const spaceData = await dispatch(read(spaceKey)).unwrap();

  if (!spaceData) {
    throw new Error("Space not found");
  }

  if (!spaceData.members.includes(userId)) {
    throw new Error("User is not a member of this space");
  }

  if (!spaceData.contents?.[contentKey]) {
    throw new Error("Content not found");
  }

  if (categoryId && !spaceData.categories?.[categoryId]) {
    throw new Error("Category not found");
  }

  const changes = {
    contents: {
      [contentKey]: {
        ...spaceData.contents[contentKey],
        categoryId: categoryId || "",
      },
    },
  };

  const updatedSpaceData = await dispatch(
    patch({ dbKey: spaceKey, changes })
  ).unwrap();

  return { spaceId, updatedSpaceData };
};
