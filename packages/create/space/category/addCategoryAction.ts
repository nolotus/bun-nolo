// create/space/category/addCategoryAction.ts (假设路径)
import type { SpaceId, SpaceData, Category } from "create/space/types";
import { selectCurrentUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { read, patch } from "database/dbSlice";
import { ulid } from "ulid";
import { selectCurrentSpaceId } from "../spaceSlice";
import type { AppDispatch, NoloRootState } from "app/store";
import { checkSpaceMembership } from "../utils/permissions"; // 确认导入路径

export const addCategoryAction = async (
  input: { name: string; categoryId?: string; order?: number },
  thunkAPI: { dispatch: AppDispatch; getState: () => NoloRootState }
): Promise<{ spaceId: SpaceId; updatedSpaceData: SpaceData }> => {
  const { name, categoryId, order } = input;
  const { dispatch, getState } = thunkAPI;
  const state = getState();
  const spaceId = selectCurrentSpaceId(state);
  if (!spaceId) {
    throw new Error("无法添加分类：未选择当前空间。");
  }
  const currentUserId = selectCurrentUserId(state);
  if (!currentUserId) {
    // 添加 userId 检查
    throw new Error("User is not logged in.");
  }

  if (!name || typeof name !== "string" || name.trim() === "") {
    throw new Error("无效的分类名称。");
  }

  const spaceKey = createSpaceKey.space(spaceId);
  let spaceData: SpaceData | null = null;
  try {
    spaceData = await dispatch(read(spaceKey)).unwrap();
  } catch (readError: any) {
    // 添加类型注解
    console.error(
      `[addCategoryAction] Failed to read space data for key ${spaceKey}:`,
      readError
    );
    throw new Error(
      `无法加载空间数据: ${spaceId}, 原因: ${readError.message || "未知错误"}`
    );
  }

  // --- 权限检查 ---
  try {
    checkSpaceMembership(spaceData, currentUserId);
  } catch (permissionError: any) {
    // 添加类型注解
    throw new Error(`权限不足，无法添加分类: ${permissionError.message}`);
  }

  const newCategoryId = categoryId || ulid();
  if (
    spaceData.categories &&
    spaceData.categories[newCategoryId] !== undefined &&
    spaceData.categories[newCategoryId] !== null
  ) {
    console.warn(
      `[addCategoryAction] Category ID "${newCategoryId}" already exists in space ${spaceId}.`
    );
    throw new Error(`分类 ID "${newCategoryId}" 已存在。`);
  }

  const existingValidCategories = spaceData.categories
    ? Object.values(spaceData.categories).filter((cat) => cat !== null)
    : [];
  const finalOrder =
    order !== undefined && typeof order === "number"
      ? order
      : existingValidCategories.length;

  // --- 统一使用 ISO 字符串格式时间戳 ---
  const nowISO = new Date().toISOString();

  const newCategory: Category = {
    name: name.trim(),
    order: finalOrder,
    updatedAt: nowISO, // 使用 ISO 字符串
    // 如果需要 createdAt，也应使用 ISO 字符串: createdAt: nowISO,
  };

  const changes = {
    categories: {
      [newCategoryId]: newCategory,
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
      `[addCategoryAction] Failed to patch space data for key ${spaceKey}:`,
      patchError
    );
    throw new Error(`添加分类失败: ${patchError.message || "未知错误"}`);
  }

  return { spaceId, updatedSpaceData };
};
