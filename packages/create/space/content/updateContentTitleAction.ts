import type { SpaceId, SpaceData } from "create/space/types"; // 确认类型路径
import { selectUserId } from "auth/authSlice"; // 确认导入路径
import { createSpaceKey } from "create/space/spaceKeys"; // 确认导入路径
import { read, patch } from "database/dbSlice"; // 确认导入路径

export const updateContentTitleAction = async (
  input: { spaceId: SpaceId; contentKey: string; title: string },
  thunkAPI: any
): Promise<{ spaceId: SpaceId; updatedSpaceData: SpaceData }> => {
  const { spaceId, contentKey, title } = input;
  const { dispatch, getState } = thunkAPI; // 从 thunkAPI 获取 getState
  const state = getState(); // 获取 state
  const userId = selectUserId(state);

  // --- 基本的输入验证 (可选但推荐) ---
  if (
    !contentKey ||
    typeof contentKey !== "string" ||
    contentKey.trim() === ""
  ) {
    throw new Error("Invalid contentKey provided.");
  }
  if (title === undefined || title === null || typeof title !== "string") {
    // 允许空标题？如果允许，移除此检查
    throw new Error("Invalid title provided.");
  }
  // 可以添加标题长度等其他验证

  const spaceKey = createSpaceKey.space(spaceId);
  let spaceData: SpaceData | null = null;
  try {
    spaceData = await dispatch(read(spaceKey)).unwrap();
  } catch (readError) {
    console.error(
      `[updateContentTitleAction] Failed to read space data for key ${spaceKey}:`,
      readError
    );
    throw new Error(`无法加载空间数据: ${spaceId}`);
  }

  if (!spaceData) {
    // 这个检查在 try...catch 后理论上可以移除，除非 read 可能返回 null 而不抛错
    throw new Error("Space not found");
  }

  // --- 权限和存在性检查 (保持不变，但添加日志) ---
  if (!spaceData.members || !spaceData.members.includes(userId)) {
    console.warn(
      `[updateContentTitleAction] User ${userId} attempt to modify content title in space ${spaceId} without membership.`
    );
    throw new Error("User is not a member of this space");
  }

  // 检查 contents 对象是否存在，以及目标 contentKey 是否存在
  if (!spaceData.contents || !spaceData.contents[contentKey]) {
    console.warn(
      `[updateContentTitleAction] Content ${contentKey} not found in space ${spaceId}.`
    );
    throw new Error("Content not found");
  }

  // --- 构造 changes 对象 (核心修改) ---
  const now = new Date().toISOString(); // 1. 获取当前时间戳

  const changes = {
    contents: {
      // 使用动态键更新指定的 contentKey
      [contentKey]: {
        ...spaceData.contents[contentKey], // 2. 保留原始内容的其他字段 (如 type, categoryId, pinned, createdAt)
        title: title.trim(), // 3. 更新标题 (可选 trim)
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
      `[updateContentTitleAction] Failed to patch space data for key ${spaceKey}:`,
      patchError
    );
    throw new Error(`更新内容标题失败: ${patchError.message || "未知错误"}`);
  }

  // 返回结果 (保持不变)
  return { spaceId, updatedSpaceData };
};
