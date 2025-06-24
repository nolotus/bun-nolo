// 文件路径: create/space/category/deleteCategoryAction.ts

import type { SpaceId } from "create/space/types";
import type { SpaceData, SpaceContent } from "app/types";
import { selectUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { read, patch } from "database/dbSlice";
import type { AppDispatch, RootState } from "app/store";
import { checkSpaceMembership } from "../utils/permissions";

type SpacePatchChanges = Partial<
  Pick<SpaceData, "categories" | "contents" | "updatedAt">
>;

export const deleteCategoryAction = async (
  input: { categoryId: string; spaceId: SpaceId },
  thunkAPI: { dispatch: AppDispatch; getState: () => RootState }
): Promise<{ spaceId: SpaceId; updatedSpaceData: SpaceData }> => {
  const { categoryId, spaceId } = input;
  const { dispatch, getState } = thunkAPI;
  const currentUserId = selectUserId(getState());

  if (!currentUserId) throw new Error("User is not logged in.");
  if (!categoryId || typeof categoryId !== "string" || !categoryId.trim())
    throw new Error("Invalid categoryId provided for deletion.");

  const spaceKey = createSpaceKey.space(spaceId);
  const spaceData = await dispatch(read(spaceKey)).unwrap();
  checkSpaceMembership(spaceData, currentUserId);

  if (!spaceData?.categories?.[categoryId])
    throw new Error("指定的分类不存在或已被删除");

  const now = Date.now();
  const changes: SpacePatchChanges = {
    categories: { [categoryId]: null },
    updatedAt: now,
  };

  if (spaceData.contents) {
    const contentsPatch: Record<string, Partial<SpaceContent> | null> = {};
    let contentsChanged = false;

    Object.keys(spaceData.contents).forEach((key) => {
      const item = spaceData.contents![key];
      if (item) {
        const needsCategoryIdRemoval =
          item.categoryId === categoryId || item.categoryId === "";

        if (needsCategoryIdRemoval) {
          contentsPatch[key] = {
            categoryId: null,
            updatedAt: now,
          };
          contentsChanged = true;
        }
      }
    });

    if (contentsChanged) changes.contents = contentsPatch;
  }

  const updatedSpaceDataResult = await dispatch(
    patch({ dbKey: spaceKey, changes })
  ).unwrap();

  return { spaceId, updatedSpaceData: updatedSpaceDataResult };
};
