import type { SpaceId, SpaceData, SpaceCategory } from "create/space/types"; // 确认类型路径, 添加 SpaceCategory
import { selectCurrentUserId } from "auth/authSlice"; // 确认导入路径
import { createSpaceKey } from "create/space/spaceKeys"; // 确认导入路径
import { read, patch } from "database/dbSlice"; // 确认导入路径

export const updateContentCategoryAction = async (
  // 输入类型保持不变，允许 categoryId 为 null 或 string
  input: { spaceId: SpaceId; contentKey: string; categoryId: string | null },
  thunkAPI: any
): Promise<{ spaceId: SpaceId; updatedSpaceData: SpaceData }> => {
  const { spaceId, contentKey, categoryId } = input;
  const { dispatch, getState } = thunkAPI; // 获取 getState
  const state = getState();
  const userId = selectCurrentUserId(state);

  // --- 基本的输入验证 (可选但推荐) ---
  if (
    !contentKey ||
    typeof contentKey !== "string" ||
    contentKey.trim() === ""
  ) {
    throw new Error("Invalid contentKey provided.");
  }
  // categoryId 可以是 null, "", 或有效的字符串 ID，这里验证逻辑会复杂些
  // 暂时依赖后续的检查

  const spaceKey = createSpaceKey.space(spaceId);
  let spaceData: SpaceData | null = null;
  try {
    spaceData = await dispatch(read(spaceKey)).unwrap();
  } catch (readError) {
    console.error(
      `[updateContentCategoryAction] Failed to read space data for key ${spaceKey}:`,
      readError
    );
    throw new Error(`无法加载空间数据: ${spaceId}`);
  }

  if (!spaceData) {
    throw new Error("Space not found"); // 理论上可以移除
  }

  // --- 权限和存在性检查 (保持不变，但添加日志和完善逻辑) ---
  if (!spaceData.members || !spaceData.members.includes(userId)) {
    console.warn(
      `[updateContentCategoryAction] User ${userId} attempt to modify content category in space ${spaceId} without membership.`
    );
    throw new Error("User is not a member of this space");
  }

  if (!spaceData.contents || !spaceData.contents[contentKey]) {
    console.warn(
      `[updateContentCategoryAction] Content ${contentKey} not found in space ${spaceId}.`
    );
    throw new Error("Content not found");
  }

  // 验证目标 CategoryId 是否有效
  // categoryId 可以是 null 或 "", 表示移动到未分类
  // 如果 categoryId 是非空字符串，则必须在 spaceData.categories 中存在且不为 null
  if (categoryId && typeof categoryId === "string") {
    if (!spaceData.categories || !spaceData.categories[categoryId]) {
      // 需要区分是 categories 对象不存在还是对应的 key 不存在/为 null
      const categoryValue = spaceData.categories?.[categoryId];
      console.warn(
        `[updateContentCategoryAction] Target category ${categoryId} not found or invalid (value: ${categoryValue}) in space ${spaceId}.`
      );
      throw new Error("Target category not found or is invalid");
    }
  }

  // --- 构造 changes 对象 (核心修改) ---
  const now = new Date().toISOString(); // 1. 获取当前时间戳
  // 统一将 null 或 undefined 的 categoryId 转换为空字符串 ""
  const finalCategoryId = categoryId ?? "";

  const changes = {
    contents: {
      // 使用动态键更新指定的 contentKey
      [contentKey]: {
        ...spaceData.contents[contentKey], // 2. 保留原始内容的其他字段
        categoryId: finalCategoryId, // 3. 更新 categoryId
        updatedAt: now, // 4. 设置该内容的嵌套 updatedAt
      },
    },
    updatedAt: now, // 5. 设置整个 Space 对象的顶层 updatedAt
  };
  // ------------------------------------

  let updatedSpaceData: SpaceData;
  try {
    updatedSpaceData = await dispatch(
      patch({ dbKey: spaceKey, changes })
    ).unwrap();
  } catch (patchError) {
    console.error(
      `[updateContentCategoryAction] Failed to patch space data for key ${spaceKey}:`,
      patchError
    );
    throw new Error(`更新内容分类失败: ${patchError.message || "未知错误"}`);
  }

  // 返回结果 (保持不变)
  return { spaceId, updatedSpaceData };
};
