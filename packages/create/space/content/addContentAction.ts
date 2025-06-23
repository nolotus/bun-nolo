// 文件路径: create/space/actions/addContentAction.ts (或你的实际路径)

import type {
  AddContentRequest,
  SpaceId,
  SpaceContent,
  SpaceData,
} from "create/space/types"; // 确认类型路径
import { selectUserId } from "auth/authSlice"; // 确认导入路径
import { createSpaceKey } from "create/space/spaceKeys"; // 确认导入路径
import { read, patch } from "database/dbSlice"; // 确认导入路径
import type { AppDispatch, RootState } from "app/store"; // 假设 store 类型路径
import { checkSpaceMembership } from "../utils/permissions"; // 导入权限检查函数
import { UNCATEGORIZED_ID } from "create/space/constants"; // 导入常量

/**
 * 异步 Action Thunk，用于向指定 Space 添加新的内容项。
 * 它负责处理所有传入的 categoryId 情况，并确保数据符合新标准：
 * - 如果 categoryId 是有效的分类 ID，则使用它。
 * - 如果 categoryId 指向无效分类、为空字符串、为 null/undefined 或等于 UNCATEGORIZED_ID，
 *   则内容将被添加为未分类（最终对象不包含 categoryId 属性）。
 */
export const addContentAction = async (
  // 输入类型：AddContentRequest 包含可选的 categoryId?: string
  // 但 Action 内部会处理更广泛的输入可能性
  input: AddContentRequest & { spaceId: SpaceId },
  thunkAPI: { dispatch: AppDispatch; getState: () => RootState }
): Promise<{ spaceId: SpaceId; updatedSpaceData: SpaceData }> => {
  // 返回类型明确
  const {
    spaceId,
    title,
    type,
    contentKey,
    categoryId: rawCategoryId, // 接收原始传入的 categoryId
    pinned = false,
    order,
  } = input;

  const { dispatch, getState } = thunkAPI;
  const state = getState();
  const userId = selectUserId(state);

  // --- 1. 基本输入验证 ---
  if (!userId) {
    throw new Error("User is not logged in.");
  }
  if (
    !contentKey ||
    typeof contentKey !== "string" ||
    contentKey.trim() === ""
  ) {
    throw new Error("Invalid contentKey provided.");
  }
  if (!title || typeof title !== "string" || title.trim() === "") {
    throw new Error("Invalid or empty title provided.");
  }
  if (!type || typeof type !== "string") {
    throw new Error("Invalid content type provided.");
  }

  // --- 2. 读取 Space 数据 ---
  const spaceKey = createSpaceKey.space(spaceId);
  let spaceData: SpaceData | null = null;
  try {
    spaceData = await dispatch(read(spaceKey)).unwrap();
  } catch (readError: any) {
    console.error(
      `[addContentAction] Failed to read space data for key ${spaceKey}:`,
      readError
    );
    throw new Error(
      `无法加载空间数据: ${spaceId}, 原因: ${readError.message || "未知错误"}`
    );
  }

  // --- 3. 权限检查 ---
  try {
    checkSpaceMembership(spaceData, userId);
  } catch (permissionError: any) {
    throw new Error(`权限不足，无法添加内容: ${permissionError.message}`);
  }

  // --- 4. 检查 Content Key 是否已存在 ---
  if (spaceData.contents && spaceData.contents[contentKey]) {
    console.warn(
      `[addContentAction] Content key "${contentKey}" already exists in space ${spaceId}.`
    );
    throw new Error(`内容键 "${contentKey}" 已存在。`);
  }

  // --- 5. 确定最终用于存储的 categoryId (string | undefined) ---
  let categoryIdForStorage: string | undefined;

  if (
    rawCategoryId && // 存在
    rawCategoryId !== "" && // 非空字符串
    rawCategoryId !== UNCATEGORIZED_ID // 也不是 UI 常量
  ) {
    // 传入的是一个需要验证的真实分类 ID
    if (spaceData.categories?.[rawCategoryId]) {
      // 分类存在且有效 (不为 null)
      categoryIdForStorage = rawCategoryId; // 使用此 ID
    } else {
      // 分类无效或不存在
      console.warn(
        `[addContentAction] Target category ${rawCategoryId} not found or invalid in space ${spaceId}. Content will be added as uncategorized.`
      );
      categoryIdForStorage = undefined; // 降级为未分类
    }
  } else {
    // 传入的是 "", null, undefined, 或 UNCATEGORIZED_ID 常量
    categoryIdForStorage = undefined; // 都视为未分类
  }

  // --- 6. 构造新内容对象 ---
  const now = Date.now(); // 使用 number 类型的时间戳

  const newSpaceContent: SpaceContent = {
    title: title.trim(),
    type,
    contentKey,
    // --- 核心: 只有当 categoryIdForStorage 不是 undefined 时才添加 categoryId 属性 ---
    ...(categoryIdForStorage !== undefined && {
      categoryId: categoryIdForStorage,
    }),
    pinned,
    createdAt: now,
    updatedAt: now,
    ...(order !== undefined && typeof order === "number" && { order }),
    // 可以考虑添加 creatorId: userId
  };

  // --- 7. 准备 Patch Changes ---
  const changes = {
    contents: {
      [contentKey]: newSpaceContent, // newSpaceContent 可能不含 categoryId
    },
    updatedAt: now, // 更新整个 Space 的时间戳
  };

  // --- 8. 执行 Patch 更新 ---
  let updatedSpaceData: SpaceData;
  try {
    updatedSpaceData = await dispatch(
      patch({ dbKey: spaceKey, changes })
    ).unwrap();
  } catch (patchError: any) {
    console.error(
      `[addContentAction] Failed to patch space data for key ${spaceKey}:`,
      patchError
    );
    throw new Error(`添加内容失败: ${patchError.message || "未知错误"}`);
  }

  // --- 9. 返回结果 ---
  return { spaceId, updatedSpaceData };
};
