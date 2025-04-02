import type {
  AddContentRequest,
  SpaceId,
  SpaceContent,
  SpaceData,
} from "create/space/types"; // 确认类型路径
import { selectCurrentUserId } from "auth/authSlice"; // 确认导入路径
import { createSpaceKey } from "create/space/spaceKeys"; // 确认导入路径
import { read, patch } from "database/dbSlice"; // 确认导入路径
import type { AppDispatch, NoloRootState } from "app/store"; // 假设 store 类型路径
import { checkSpaceMembership } from "../utils/permissions"; // 导入权限检查函数

export const addContentAction = async (
  // 输入类型现在包含了可选的 order
  input: AddContentRequest & { spaceId: SpaceId },
  thunkAPI: { dispatch: AppDispatch; getState: () => NoloRootState }
) => {
  const {
    spaceId,
    title,
    type,
    contentKey,
    categoryId, // 可选, 默认为 ""
    pinned = false, // 默认 false
    order, // 可选的分组内排序
  } = input;

  const { dispatch, getState } = thunkAPI;
  const state = getState();
  const userId = selectCurrentUserId(state); // userId 也是创建者 ID (creatorId)

  // --- 基本输入验证 ---
  if (
    !contentKey ||
    typeof contentKey !== "string" ||
    contentKey.trim() === ""
  ) {
    throw new Error("Invalid contentKey provided.");
  }
  if (!title || typeof title !== "string") {
    // 标题通常是必须的
    throw new Error("Invalid title provided.");
  }
  if (!type || typeof type !== "string") {
    // 类型也是必须的
    throw new Error("Invalid content type provided.");
  }
  // categoryId 验证 (如果提供且非空)
  // pinned 验证 (应为布尔值)
  // order 验证 (如果提供，应为数字)

  const spaceKey = createSpaceKey.space(spaceId);
  let spaceData: SpaceData | null = null;
  try {
    spaceData = await dispatch(read(spaceKey)).unwrap();
  } catch (readError) {
    console.error(
      `[addContentAction] Failed to read space data for key ${spaceKey}:`,
      readError
    );
    throw new Error(
      `无法加载空间数据: ${spaceId}, 原因: ${readError.message || "未知错误"}`
    );
  }

  // --- 权限检查 ---
  try {
    checkSpaceMembership(spaceData, userId);
  } catch (permissionError) {
    throw new Error(`权限不足，无法添加内容: ${permissionError.message}`);
  }

  // --- 存在性检查 (contentKey 是否已存在?) ---
  if (spaceData.contents && spaceData.contents[contentKey]) {
    // 根据业务逻辑决定是报错、忽略还是更新？这里选择报错
    console.warn(
      `[addContentAction] Content key "${contentKey}" already exists in space ${spaceId}.`
    );
    throw new Error(`内容键 "${contentKey}" 已存在。`);
  }

  // --- 检查目标 CategoryId 是否有效 (如果提供了) ---
  const finalCategoryId = categoryId ?? ""; // 处理 null/undefined 为 ""
  if (finalCategoryId !== "") {
    if (!spaceData.categories || !spaceData.categories[finalCategoryId]) {
      const categoryValue = spaceData.categories?.[finalCategoryId];
      console.warn(
        `[addContentAction] Target category ${finalCategoryId} not found or invalid (value: ${categoryValue}) in space ${spaceId}.`
      );
      // 决定是报错还是添加到未分类？这里选择报错
      throw new Error(`目标分类 "${finalCategoryId}" 不存在或无效。`);
      // 或者可以降级处理：finalCategoryId = "";
    }
  }

  // --- 构造新内容对象和 changes (核心修改) ---
  const now = Date.now(); // 使用 number 类型的时间戳，与 types.ts 一致

  // 创建新的 SpaceContent 对象
  const newSpaceContent: SpaceContent = {
    title: title.trim(), // 可选 trim
    type,
    contentKey,
    categoryId: finalCategoryId,
    pinned,
    createdAt: now, // 1. 设置创建时间戳
    updatedAt: now, // 2. 设置初始更新时间戳 (与创建时间相同)
    // 只有当 input 中提供了有效的 order 时才添加 order 字段
    ...(order !== undefined && typeof order === "number" && { order }),
    // 可以考虑添加 creatorId: userId
  };

  // 准备增量更新 (只包含新增的内容和顶层时间戳)
  const changes = {
    contents: {
      // 使用动态键添加新内容
      [contentKey]: newSpaceContent,
    },
    updatedAt: now, // 3. 设置整个 Space 对象的顶层 updatedAt
  };
  // ------------------------------------

  let updatedSpaceData: SpaceData;
  try {
    updatedSpaceData = await dispatch(
      patch({ dbKey: spaceKey, changes })
    ).unwrap();
  } catch (patchError) {
    console.error(
      `[addContentAction] Failed to patch space data for key ${spaceKey}:`,
      patchError
    );
    throw new Error(`添加内容失败: ${patchError.message || "未知错误"}`);
  }

  // 返回结果 (保持不变)
  return { spaceId, updatedSpaceData };
};
