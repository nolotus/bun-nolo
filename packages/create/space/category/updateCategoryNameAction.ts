// src/create/space/category/updateCategoryNameAction.ts (假设路径)
import type { SpaceId, SpaceData } from "create/space/types";
import { selectCurrentUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { read, patch } from "database/dbSlice";
import type { AppDispatch, NoloRootState } from "app/store";
import { checkSpaceMembership } from "../utils/permissions"; // 确认导入路径

export const updateCategoryNameAction = async (
  input: { spaceId: SpaceId; categoryId: string; name: string },
  thunkAPI: { dispatch: AppDispatch; getState: () => NoloRootState } // 使用具体类型
): Promise<{ spaceId: SpaceId; updatedSpaceData: SpaceData }> => {
  const { spaceId, categoryId, name } = input;
  const { dispatch, getState } = thunkAPI;
  const state = getState();
  const currentUserId = selectCurrentUserId(state);
  if (!currentUserId) {
    // 添加 userId 检查
    throw new Error("User is not logged in.");
  }

  if (
    !categoryId ||
    typeof categoryId !== "string" ||
    categoryId.trim() === ""
  ) {
    throw new Error("Invalid categoryId provided.");
  }
  if (name === undefined || name === null || typeof name !== "string") {
    throw new Error("Invalid category name provided.");
  }

  const spaceKey = createSpaceKey.space(spaceId);
  let spaceData: SpaceData | null = null;
  try {
    spaceData = await dispatch(read(spaceKey)).unwrap();
  } catch (error: any) {
    // 添加类型注解
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
    checkSpaceMembership(spaceData, currentUserId); // 使用提取的函数
  } catch (permissionError: any) {
    // 添加类型注解
    throw new Error(`权限不足，无法修改分类名称: ${permissionError.message}`);
  }

  if (!spaceData.categories || !spaceData.categories[categoryId]) {
    console.warn(
      `[updateCategoryNameAction] Category ${categoryId} not found in space ${spaceId}.`
    );
    throw new Error("指定的分类不存在");
  }

  // --- 统一使用 ISO 字符串格式时间戳 ---
  const nowISO = new Date().toISOString();

  const changes = {
    categories: {
      [categoryId]: {
        ...spaceData.categories[categoryId], // 保留原始字段
        name: name.trim(),
        updatedAt: nowISO, // 统一使用 ISO 字符串
      },
    },
    updatedAt: nowISO, // 统一使用 ISO 字符串
  };

  let updatedSpaceData: SpaceData;
  try {
    updatedSpaceData = await dispatch(
      patch({ dbKey: spaceKey, changes })
    ).unwrap();
  } catch (patchError: any) {
    // 添加类型注解
    console.error(
      `[updateCategoryNameAction] Failed to patch space data for key ${spaceKey}:`,
      patchError
    );
    throw new Error(`更新分类名称失败: ${patchError.message || "未知错误"}`);
  }

  return { spaceId, updatedSpaceData };
};
