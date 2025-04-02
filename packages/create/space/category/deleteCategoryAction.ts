// create/space/category/deleteCategoryAction.ts
import type {
  SpaceId,
  SpaceData,
  Category,
  Contents,
} from "create/space/types";
import { selectCurrentUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { read, patch } from "database/dbSlice";
import type { AppDispatch, NoloRootState } from "app/store";
import { checkSpaceMembership } from "../utils/permissions";
import { UNCATEGORIZED_ID } from "create/space/constants"; // 导入常量

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
    throw new Error("Invalid categoryId provided.");
  }
  // 使用常量进行比较
  if (categoryId === UNCATEGORIZED_ID) {
    // 注意：这里不允许删除代表"未分类"的逻辑可能需要重新考虑，
    // 因为 "" 本身不是一个可删除的实体分类。
    // 但如果你的系统曾允许创建一个字面量为 "" 的分类，则此检查有效。
    // 通常，"" 是一个状态，而不是一个可操作的分类条目。
    // 确认下这里的业务逻辑是否确实是阻止删除一个 key 为 "" 的分类。
    // 如果 "" 只是内容的 *状态*，这个检查可能不需要。
    // 假设你确实可能有一个 key 为 "" 的分类需要阻止删除：
    throw new Error(
      "Cannot delete the default 'uncategorized' representation."
    );
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
  if (!spaceData?.categories?.[categoryId]) {
    // 增加了 spaceData 的可选链
    console.warn(
      `[deleteCategoryAction] Category ${categoryId} not found or SpaceData missing categories in space ${spaceId}. Action Aborted.`
    );
    throw new Error("指定的分类不存在或已被删除");
  }

  // --- 构建更新 ---
  const now = Date.now(); // 使用数字时间戳，与类型匹配
  const changes: SpacePatchChanges = {
    // 使用 Record<string, Category | null> 类型
    categories: { ...spaceData.categories, [categoryId]: null } as Record<
      string,
      Category | null
    >,
    updatedAt: now,
  };

  // --- 处理关联内容 ---
  if (spaceData.contents) {
    const updatedContents: Contents = { ...spaceData.contents }; // 使用 Contents 类型
    let contentsChanged = false;
    Object.keys(updatedContents).forEach((key) => {
      const item = updatedContents[key];
      // 确保 item 存在且 categoryId 匹配
      if (item && item.categoryId === categoryId) {
        // 更新 categoryId 为未分类 ID 常量
        updatedContents[key] = {
          ...item,
          categoryId: UNCATEGORIZED_ID,
          updatedAt: now,
        }; // 同时更新内容的 updatedAt
        contentsChanged = true;
      }
    });

    if (contentsChanged) {
      changes.contents = updatedContents;
    }
  }

  // --- 执行更新 ---
  let updatedSpaceDataResult: SpaceData; // 重命名以避免与外部的 updatedSpaceData 混淆
  try {
    updatedSpaceDataResult = await dispatch(
      patch({ dbKey: spaceKey, changes })
    ).unwrap();
  } catch (error: any) {
    console.error(
      `[deleteCategoryAction] Patch Data failed for key ${spaceKey}:`,
      error
    );
    throw new Error(`删除分类失败: ${error.message || "未知错误"}`);
  }

  return { spaceId, updatedSpaceData: updatedSpaceDataResult };
};
