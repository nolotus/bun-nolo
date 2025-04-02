// src/create/space/category/deleteCategoryAction.ts
import type { SpaceId, SpaceData, Category } from "create/space/types"; // 假设 Category 类型已定义
import { selectCurrentUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { read, patch } from "database/dbSlice";
import type { AppDispatch, NoloRootState } from "app/store";
import { checkSpaceMembership } from "../utils/permissions";

// 定义一个更具体的 changes 类型，可以是 SpaceData 的部分属性
type SpacePatchChanges = Partial<
  Pick<SpaceData, "categories" | "contents" | "updatedAt">
>;

export const deleteCategoryAction = async (
  input: { categoryId: string; spaceId: SpaceId },
  thunkAPI: { dispatch: AppDispatch; getState: () => NoloRootState }
): Promise<{ spaceId: SpaceId; updatedSpaceData: SpaceData }> => {
  const { categoryId, spaceId } = input;
  const { dispatch, getState } = thunkAPI;
  const state = getState();
  const currentUserId = selectCurrentUserId(state);

  // --- 输入和状态验证 ---
  if (!currentUserId) {
    throw new Error("User is not logged in.");
  }
  if (!categoryId || typeof categoryId !== "string") {
    // 添加基础 categoryId 验证
    throw new Error("Invalid categoryId provided.");
  }
  // "uncategorized" 通常不允许删除
  if (categoryId === "uncategorized") {
    throw new Error("Cannot delete the default 'uncategorized' category.");
  }

  const spaceKey = createSpaceKey.space(spaceId);

  // --- 读取数据 ---
  let spaceData: SpaceData | null;
  try {
    spaceData = await dispatch(read(spaceKey)).unwrap();
  } catch (error: any) {
    console.error(
      `[deleteCategoryAction] Read SpaceData failed for key ${spaceKey}:`,
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
    throw new Error(`权限不足，无法删除分类: ${permissionError.message}`);
  }

  // --- 分类存在性检查 ---
  if (!spaceData.categories?.[categoryId]) {
    console.warn(
      `[deleteCategoryAction] Category ${categoryId} not found in space ${spaceId}. Action Aborted.`
    );
    // 如果分类不存在，可以选择不抛出错误而是直接返回当前数据，或者按需抛错
    throw new Error("指定的分类不存在或已被删除");
    // 或者 return { spaceId, updatedSpaceData: spaceData }; (取决于业务需求)
  }

  // --- 构建更新 ---
  const nowISO = new Date().toISOString();
  // 使用更具体的类型
  const changes: SpacePatchChanges = {
    categories: { ...spaceData.categories, [categoryId]: null }, // 标记删除分类 (值为 null)
    updatedAt: nowISO,
  };

  // --- 处理关联内容 ---
  if (spaceData.contents) {
    const updatedContents = { ...spaceData.contents };
    let contentsChanged = false;
    Object.keys(updatedContents).forEach((key) => {
      const item = updatedContents[key];
      // 确保 item 存在且 categoryId 匹配
      if (item && item.categoryId === categoryId) {
        // 更新 categoryId 为空字符串 "" (代表未分类)
        updatedContents[key] = { ...item, categoryId: "" };
        contentsChanged = true;
        // console.log(`[deleteCategoryAction] Cleared category for content: ${key}`); // 生产环境移除
      }
    });

    if (contentsChanged) {
      changes.contents = updatedContents;
    }
  }

  // --- 执行更新 ---
  let updatedSpaceData: SpaceData;
  try {
    updatedSpaceData = await dispatch(
      patch({ dbKey: spaceKey, changes })
    ).unwrap();
    // console.log("[deleteCategoryAction] Patch successful. Updated SpaceData categories keys:", Object.keys(updatedSpaceData.categories || {}).filter(k => updatedSpaceData.categories[k] !== null)); // 生产环境移除或调整
  } catch (error: any) {
    console.error(
      `[deleteCategoryAction] Patch Data failed for key ${spaceKey}:`,
      error
    );
    throw new Error(`删除分类失败: ${error.message || "未知错误"}`);
  }

  return { spaceId, updatedSpaceData };
};
