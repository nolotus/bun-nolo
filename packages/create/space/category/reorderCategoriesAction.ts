// create/space/category/reorderCategoriesAction.ts (假设路径)
import type { ULID } from "app/types";
import type { SpaceData, Category } from "app/types";
import { selectUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { read, patch } from "database/dbSlice";
import type { AppDispatch, RootState } from "app/store";
import { checkSpaceMembership } from "../utils/permissions"; // 确认导入路径

export const reorderCategoriesAction = async (
  input: { spaceId: ULID; sortedCategoryIds: string[] },
  thunkAPI: { dispatch: AppDispatch; getState: () => RootState } // 使用具体类型
): Promise<{ spaceId: ULID; updatedSpaceData: SpaceData }> => {
  const { spaceId, sortedCategoryIds } = input;
  const { dispatch, getState } = thunkAPI;
  const state = getState();
  const currentUserId = selectUserId(state);
  if (!currentUserId) {
    // 添加 userId 检查
    throw new Error("User is not logged in.");
  }

  if (!Array.isArray(sortedCategoryIds)) {
    throw new Error("Invalid sortedCategoryIds provided: must be an array.");
  }

  const spaceKey = createSpaceKey.space(spaceId);
  let spaceData: SpaceData | null = null;
  try {
    spaceData = await dispatch(read(spaceKey)).unwrap();
  } catch (readError: any) {
    // 添加类型注解
    console.error(
      `[reorderCategoriesAction] Failed to read space data for key ${spaceKey}:`,
      readError
    );
    throw new Error(
      `无法加载空间数据: ${spaceId}, 原因: ${readError.message || "未知错误"}`
    );
  }

  // --- 权限检查 ---
  try {
    checkSpaceMembership(spaceData, currentUserId); // 使用提取的函数
  } catch (permissionError: any) {
    // 添加类型注解
    throw new Error(`权限不足，无法进行分类排序: ${permissionError.message}`);
  }

  if (!spaceData.categories || Object.keys(spaceData.categories).length === 0) {
    console.warn(
      `[reorderCategoriesAction] No categories found in space ${spaceId} to reorder.`
    );
    // 返回当前数据，不抛错，因为对空列表排序无意义但非错误
    return { spaceId, updatedSpaceData: spaceData };
    // 或者如果认为这是错误，则抛出:
    // throw new Error("当前空间没有分类可排序");
  }

  // --- 统一使用 ISO 字符串格式时间戳 ---
  const nowISO = new Date().toISOString();
  const currentCategories = spaceData.categories;

  const updatedCategoriesChanges = sortedCategoryIds.reduce(
    (acc, catId, index) => {
      const existingCategory = currentCategories[catId];
      if (existingCategory && existingCategory !== null) {
        // 确保分类存在且不为 null
        acc[catId] = {
          ...existingCategory,
          order: index,
          updatedAt: nowISO, // 统一使用 ISO 字符串
        };
      } else {
        console.warn(
          `[reorderCategoriesAction] Category ID "${catId}" from input array not found or invalid in current space categories. Skipping.`
        );
      }
      return acc;
    },
    {} as Record<string, Category | null> // 使用类型断言
  );

  // 检查是否有实际有效的变更
  let hasValidChanges = false;
  for (const catId in updatedCategoriesChanges) {
    // 比较新旧 order 是否不同，或者仅检查是否有有效 key 存在即可
    if (
      updatedCategoriesChanges[catId] !== null &&
      currentCategories[catId]?.order !== updatedCategoriesChanges[catId]?.order
    ) {
      hasValidChanges = true;
      break;
    }
    // 如果只关心是否应用了 updatedAt，检查长度即可
    if (updatedCategoriesChanges[catId] !== null) {
      hasValidChanges = true;
      break;
    }
  }

  if (!hasValidChanges) {
    console.log(
      "[reorderCategoriesAction] No actual reordering changes detected or no valid categories processed. Skipping patch."
    );
    return { spaceId, updatedSpaceData: spaceData };
  }

  const changes = {
    categories: updatedCategoriesChanges,
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
      `[reorderCategoriesAction] Failed to patch space data for key ${spaceKey}:`,
      patchError
    );
    throw new Error(`分类排序失败: ${patchError.message || "未知错误"}`);
  }

  return { spaceId, updatedSpaceData };
};
