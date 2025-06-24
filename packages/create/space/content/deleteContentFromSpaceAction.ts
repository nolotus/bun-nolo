// src/database/actions/space/deleteContentFromSpaceAction.ts (请根据你的项目结构调整路径)
import { selectUserId } from "auth/authSlice"; // 假设路径
import { createSpaceKey } from "create/space/spaceKeys"; // 假设路径
import { patch, read, remove } from "database/dbSlice"; // 从 dbSlice 导入
import { SpaceData } from "app/types";
import pino from "pino"; // 假设你使用 pino 进行日志记录

const logger = pino({
  level: "info",
  transport: {
    target: "pino-pretty",
  },
});

/**
 * 从指定的 Space 中删除内容的引用，并随后删除内容实体本身。
 * @param input 包含 contentKey 和 spaceId 的对象
 * @param thunkAPI Redux Thunk API 对象
 * @returns 包含 contentKey, spaceId 和更新后的 spaceData 的对象
 */
export const deleteContentFromSpaceAction = async (
  input: { contentKey: string; spaceId: string },
  thunkAPI: any // 使用 'any' 或定义一个更具体的 ThunkAPI 类型
) => {
  const { contentKey, spaceId } = input;
  const { dispatch, getState } = thunkAPI;
  const state = getState();
  const userId = selectUserId(state); // 获取当前用户 ID

  logger.info(
    { contentKey, spaceId, userId },
    "Initiating deleteContentFromSpaceAction"
  );

  // 1. 获取 Space 数据
  const spaceKey = createSpaceKey.space(spaceId);
  let spaceData: SpaceData | null = null;
  try {
    spaceData = (await dispatch(read(spaceKey)).unwrap()) as SpaceData | null;
  } catch (readError) {
    logger.error(
      { error: readError, spaceKey },
      "Failed to read space data before deleting content"
    );
    throw new Error(`无法加载空间数据: ${spaceId}`);
  }

  if (!spaceData) {
    logger.error({ spaceKey }, "Space data not found");
    throw new Error("空间不存在");
  }

  // 2. 权限检查 (示例：仅限成员)
  // 你可能需要更复杂的逻辑，例如检查 owner/admin 角色
  if (!userId || !spaceData.members.includes(userId)) {
    logger.warn(
      { userId, spaceId, members: spaceData.members },
      "Unauthorized attempt to delete content from space"
    );
    throw new Error("无权修改此空间");
  }

  // 3. 更新 Space 数据 (删除引用)
  let spaceUpdateError: Error | null = null;
  if (spaceData.contents && spaceData.contents[contentKey]) {
    logger.info(
      { contentKey, spaceKey },
      "Content reference found. Patching space data to remove reference."
    );
    const changes = {
      contents: {
        [contentKey]: null, // 使用 null 表示删除该键
      },
    };
    try {
      await dispatch(
        patch({
          dbKey: spaceKey,
          changes,
        })
      ).unwrap();
      logger.info(
        { contentKey, spaceKey },
        "Successfully patched space data (removed reference)"
      );
    } catch (patchError: any) {
      logger.error(
        { error: patchError, spaceKey, contentKey },
        "Failed to patch space data (remove content reference)"
      );
      // 决定是否继续尝试删除实体，或者在这里失败
      // 如果 patch 失败，可能不应该继续删除实体
      spaceUpdateError = new Error(
        `更新空间引用失败: ${patchError.message || "未知错误"}`
      );
      // 可以选择在这里抛出错误，或者记录下来并在最后处理
      // throw spaceUpdateError; // 如果认为这是关键失败
    }
  } else {
    logger.warn(
      { contentKey, spaceKey },
      "Content reference not found in space data. Skipping patch."
    );
    // 即使引用不存在，仍然尝试删除实体，以防实体数据是孤立的
  }

  // 如果更新 Space 失败，则不继续删除实体（除非你改变策略）
  if (spaceUpdateError) {
    throw spaceUpdateError;
  }

  // 4. 删除内容实体本身 (从 dbSlice)
  let entityRemoveError: Error | null = null;
  try {
    logger.info(
      { contentKey },
      "Dispatching dbSlice.remove for content entity"
    );
    await dispatch(remove(contentKey)).unwrap(); // 使用 contentKey 作为实体的 dbKey
    logger.info(
      { contentKey },
      "Successfully removed content entity via dbSlice.remove"
    );
  } catch (removeError: any) {
    logger.error(
      { error: removeError, contentKey },
      "Failed to remove content entity using dbSlice.remove"
    );
    // 记录错误，但可能仍然认为操作部分成功（因为引用已删除）
    // 根据你的需求决定是否将此视为整体失败
    entityRemoveError = new Error(
      `删除内容数据失败: ${removeError.message || "未知错误"}`
    );
    // throw entityRemoveError; // 如果认为这也是关键失败
  }

  // 5. 获取最新的 Space 数据以返回 (可选，但推荐)
  let finalSpaceData: SpaceData | null = null;
  try {
    finalSpaceData = (await dispatch(
      read(spaceKey)
    ).unwrap()) as SpaceData | null;
  } catch (finalReadError) {
    logger.error(
      { error: finalReadError, spaceKey },
      "Failed to re-read space data after operations"
    );
    // 即使最终读取失败，操作可能已经成功，返回 null 或之前的 spaceData？
    // 返回 null 可能是最安全的，表示最终状态未知
  }

  // 6. 返回结果
  // 如果实体删除失败，你可能想在这里包含错误信息或不同的标志
  if (entityRemoveError) {
    // 可以选择抛出错误，或者在返回对象中添加错误信息
    logger.warn(
      { contentKey, spaceId },
      "Content entity removal failed, returning potentially incomplete success state."
    );
  }

  return {
    contentKey,
    spaceId,
    updatedSpaceData: finalSpaceData, // 返回最新的（或 null 如果读取失败）
    entityRemoveError: entityRemoveError?.message, // 可选：传递错误信息
  };
};
