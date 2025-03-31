import type { SpaceId, SpaceData } from "create/space/types";
import { selectCurrentUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { read, patch } from "database/dbSlice";

export const deleteCategoryAction = async (
  input: { categoryId: string; spaceId: SpaceId },
  thunkAPI: any
): Promise<{ spaceId: SpaceId; updatedSpaceData: SpaceData }> => {
  const { categoryId, spaceId } = input;
  console.log("[DEBUG] Input:", { categoryId, spaceId });

  const state = thunkAPI.getState();
  const { dispatch } = thunkAPI;
  const currentUserId = selectCurrentUserId(state);
  console.log("[DEBUG] User:", currentUserId);

  const spaceKey = createSpaceKey.space(spaceId);
  console.log("[DEBUG] SpaceKey:", spaceKey);

  let spaceData: SpaceData | null;
  try {
    spaceData = await dispatch(read(spaceKey)).unwrap();
    console.log("[DEBUG] SpaceData:", {
      id: spaceData?.id,
      categories: Object.keys(spaceData?.categories || {}),
      contents: Object.keys(spaceData?.contents || {}),
    });
  } catch (error) {
    console.error("[ERROR] Read SpaceData failed:", error);
    throw error;
  }
  if (!spaceData) throw new Error("空间不存在");
  if (!spaceData.members.includes(currentUserId))
    throw new Error("当前用户无权限删除分类");
  if (!spaceData.categories?.[categoryId]) throw new Error("指定的分类不存在");

  const changes: any = {
    categories: { ...spaceData.categories, [categoryId]: null },
  };
  console.log("[DEBUG] Changes (categories):", changes.categories);

  if (spaceData.contents) {
    changes.contents = { ...spaceData.contents };
    Object.keys(changes.contents).forEach((key) => {
      const item = changes.contents[key];
      if (item && item.categoryId === categoryId) {
        changes.contents[key] = { ...item, categoryId: "" };
        console.log("[DEBUG] Cleared category for content:", key);
      }
    });
  }

  let updatedSpaceData: SpaceData;
  try {
    updatedSpaceData = await dispatch(
      patch({ dbKey: spaceKey, changes })
    ).unwrap();
    console.log("[DEBUG] Updated SpaceData:", {
      categories: Object.keys(updatedSpaceData.categories || {}),
      contents: Object.keys(updatedSpaceData.contents || {}),
    });
  } catch (error) {
    console.error("[ERROR] Patch Data failed:", error);
    throw error;
  }
  console.log("[DEBUG] Final result:", {
    spaceId,
    updatedSpaceDataId: updatedSpaceData.id,
  });
  return { spaceId, updatedSpaceData };
};
