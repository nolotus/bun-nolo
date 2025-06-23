// create/space/category/updateCategoryNameAction.ts
import type { SpaceId, SpaceData } from "create/space/types";
import { selectUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { read, patch } from "database/dbSlice";
import type { AppDispatch, RootState } from "app/store";
import { checkSpaceMembership } from "../utils/permissions"; // 确认导入路径

export const updateCategoryNameAction = async (
  input: { spaceId: SpaceId; categoryId: string; name: string },
  thunkAPI: { dispatch: AppDispatch; getState: () => RootState }
): Promise<{ spaceId: SpaceId; updatedSpaceData: SpaceData }> => {
  const { spaceId, categoryId, name } = input;
  const { dispatch, getState } = thunkAPI;
  const state = getState();
  const currentUserId = selectUserId(state);

  // --- 输入验证 ---
  if (!currentUserId) {
    throw new Error("User is not logged in.");
  }
  if (
    !categoryId ||
    typeof categoryId !== "string" ||
    !categoryId.trim() // 稍微简化：检查非空且非空白字符串
  ) {
    throw new Error("Invalid categoryId provided.");
  }
  // 验证 name (先 trim 再检查)
  if (name === undefined || name === null || typeof name !== "string") {
    // 基础类型检查仍然需要
    throw new Error("Invalid category name type provided.");
  }
  const trimmedName = name.trim(); // 获取处理后的名称
  if (!trimmedName) {
    // 检查处理后的名称是否为空
    throw new Error("Category name cannot be empty or only whitespace.");
  }

  const spaceKey = createSpaceKey.space(spaceId);
  let spaceData: SpaceData | null = null;
  try {
    spaceData = await dispatch(read(spaceKey)).unwrap();
  } catch (error: any) {
    console.error(
      `[updateCategoryNameAction] Failed to read space data for key ${spaceKey}:`,
      error
    );
    throw new Error(
      `无法加载空间数据: ${spaceId}, 原因: ${error.message || "未知错误"}`
    );
  }

  // --- 权限检查 ---
  try {
    checkSpaceMembership(spaceData, currentUserId);
  } catch (permissionError: any) {
    throw new Error(`权限不足，无法修改分类名称: ${permissionError.message}`);
  }

  // --- 分类存在性检查 ---
  if (!spaceData.categories || !spaceData.categories[categoryId]) {
    console.warn(
      `[updateCategoryNameAction] Category ${categoryId} not found in space ${spaceId}.`
    );
    throw new Error("指定的分类不存在");
  }

  // --- 构建更新 ---
  const nowISO = new Date().toISOString();
  const changes = {
    categories: {
      [categoryId]: {
        ...spaceData.categories[categoryId], // 保留原始字段
        name: trimmedName, // 使用 trim 后的名称
        updatedAt: nowISO,
      },
    },
    updatedAt: nowISO,
  };

  // --- 执行更新 ---
  let updatedSpaceData: SpaceData;
  try {
    updatedSpaceData = await dispatch(
      patch({ dbKey: spaceKey, changes })
    ).unwrap();
  } catch (patchError: any) {
    console.error(
      `[updateCategoryNameAction] Failed to patch space data for key ${spaceKey}:`,
      patchError
    );
    throw new Error(`更新分类名称失败: ${patchError.message || "未知错误"}`);
  }

  return { spaceId, updatedSpaceData };
};
