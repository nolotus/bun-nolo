// 文件路径: create/space/actions/addContentAction.ts

import type { SpaceId } from "create/space/types";
import type { SpaceData, SpaceContent, ContentType } from "app/types";
import { selectUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { read, patch } from "database/dbSlice";
import type { AppDispatch, RootState } from "app/store";
import { checkSpaceMembership } from "../utils/permissions";
import { UNCATEGORIZED_ID } from "create/space/constants";

export interface AddContentRequest {
  title: string;
  type: ContentType;
  contentKey: string;
  categoryId?: string;
  pinned?: boolean;
  order?: number;
}

export const addContentAction = async (
  input: AddContentRequest & { spaceId: SpaceId },
  thunkAPI: { dispatch: AppDispatch; getState: () => RootState }
): Promise<{ spaceId: SpaceId; updatedSpaceData: SpaceData }> => {
  const {
    spaceId,
    title,
    type,
    contentKey,
    categoryId: rawCategoryId,
    pinned = false,
    order,
  } = input;

  const { dispatch, getState } = thunkAPI;
  const userId = selectUserId(getState());

  // 基本输入验证
  if (!userId) throw new Error("User is not logged in.");
  if (!contentKey || typeof contentKey !== "string" || contentKey.trim() === "")
    throw new Error("Invalid contentKey provided.");
  if (!title || typeof title !== "string" || title.trim() === "")
    throw new Error("Invalid or empty title provided.");
  if (!type || typeof type !== "string")
    throw new Error("Invalid content type provided.");

  // 读取 Space 数据
  const spaceKey = createSpaceKey.space(spaceId);
  const spaceData = await dispatch(read(spaceKey)).unwrap();

  // 权限检查
  checkSpaceMembership(spaceData, userId);

  // 检查 Content Key 是否已存在
  if (spaceData.contents && spaceData.contents[contentKey]) {
    throw new Error(`内容键 "${contentKey}" 已存在。`);
  }

  // 确定最终用于存储的 categoryId
  let categoryIdForStorage: string | undefined;
  if (
    rawCategoryId &&
    rawCategoryId !== "" &&
    rawCategoryId !== UNCATEGORIZED_ID
  ) {
    if (spaceData.categories?.[rawCategoryId]) {
      categoryIdForStorage = rawCategoryId;
    }
  }

  // 构造新内容对象
  const now = Date.now();
  const newSpaceContent: SpaceContent = {
    title: title.trim(),
    type,
    contentKey,
    ...(categoryIdForStorage !== undefined && {
      categoryId: categoryIdForStorage,
    }),
    pinned,
    createdAt: now,
    updatedAt: now,
    ...(order !== undefined && typeof order === "number" && { order }),
  };

  // 准备并执行 Patch 更新
  const changes = {
    contents: { [contentKey]: newSpaceContent },
    updatedAt: now,
  };

  const updatedSpaceData = await dispatch(
    patch({ dbKey: spaceKey, changes })
  ).unwrap();

  return { spaceId, updatedSpaceData };
};
