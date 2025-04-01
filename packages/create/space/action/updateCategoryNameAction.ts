import type { SpaceId, SpaceData } from "create/space/types"; // 确认类型路径
import { selectCurrentUserId } from "auth/authSlice"; // 确认导入路径
import { createSpaceKey } from "create/space/spaceKeys"; // 确认导入路径
import { read, patch } from "database/dbSlice"; // 确认导入路径

export const updateCategoryNameAction = async (
  input: { spaceId: SpaceId; categoryId: string; name: string },
  thunkAPI: any
): Promise<{ spaceId: SpaceId; updatedSpaceData: SpaceData }> => {
  const { spaceId, categoryId, name } = input;
  const { dispatch, getState } = thunkAPI; // 从 thunkAPI 获取 getState
  const state = getState(); // 获取 state
  const currentUserId = selectCurrentUserId(state);

  // --- 基本的输入验证 (可选但推荐) ---
  if (
    !categoryId ||
    typeof categoryId !== "string" ||
    categoryId.trim() === ""
  ) {
    throw new Error("Invalid categoryId provided.");
  }
  if (name === undefined || name === null || typeof name !== "string") {
    // 允许空名称？如果允许，移除此检查
    throw new Error("Invalid category name provided.");
  }
  // 可以添加名称长度等其他验证

  const spaceKey = createSpaceKey.space(spaceId);
  let spaceData: SpaceData | null = null; // 初始化为 null
  try {
    spaceData = await dispatch(read(spaceKey)).unwrap();
  } catch (error) {
    console.error(
      `[updateCategoryNameAction] Failed to read space data for key ${spaceKey}:`,
      error
    );
    // 根据 readAction 的行为决定是抛出还是处理 null
    // 假设 readAction 失败会抛出错误
    throw new Error(`无法加载空间数据: ${spaceId}`);
  }

  if (!spaceData) {
    throw new Error("空间不存在");
  }

  // --- 权限和存在性检查 (保持不变) ---
  if (!spaceData.members || !spaceData.members.includes(currentUserId)) {
    // 添加日志可能更好
    console.warn(
      `[updateCategoryNameAction] User ${currentUserId} attempt to modify category name in space ${spaceId} without membership.`
    );
    throw new Error("当前用户不是空间成员，无法修改分类名称");
  }

  // 检查 categories 对象是否存在，以及目标 categoryId 是否存在
  if (!spaceData.categories || !spaceData.categories[categoryId]) {
    // 添加日志可能更好
    console.warn(
      `[updateCategoryNameAction] Category ${categoryId} not found in space ${spaceId}.`
    );
    throw new Error("指定的分类不存在");
  }

  // --- 构造 changes 对象 (核心修改) ---
  const now = new Date().toISOString(); // 1. 获取当前时间戳

  const changes = {
    categories: {
      // 使用动态键更新指定的 categoryId
      [categoryId]: {
        ...spaceData.categories[categoryId], // 2. 保留原始分类的其他字段 (如 order)
        name: name.trim(), // 3. 更新名称 (可选 trim)
        updatedAt: now, // 4. 设置该分类的嵌套 updatedAt
      },
    },
    updatedAt: now, // 5. 设置整个 Space 对象的顶层 updatedAt
  };
  // ------------------------------------

  let updatedSpaceData: SpaceData; // 在 try 块外部声明
  try {
    updatedSpaceData = await dispatch(
      patch({ dbKey: spaceKey, changes })
    ).unwrap();
  } catch (patchError) {
    console.error(
      `[updateCategoryNameAction] Failed to patch space data for key ${spaceKey}:`,
      patchError
    );
    // 可以选择抛出更具体的错误或原始错误
    throw new Error(`更新分类名称失败: ${patchError.message || "未知错误"}`);
  }

  // 返回结果 (保持不变)
  return { spaceId, updatedSpaceData };
};
