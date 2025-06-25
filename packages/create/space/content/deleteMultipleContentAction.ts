import { selectUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { patch, read, remove } from "database/dbSlice";
import { SpaceData } from "app/types";
import pino from "pino";

const logger = pino({
  level: "info",
  transport: {
    target: "pino-pretty",
  },
});

/**
 * 从指定的 Space 中批量删除多个内容。
 * 此函数会先用一个 patch 操作原子性地移除所有内容的引用，
 * 然后并行地删除每个内容实体。
 * @param input 包含 contentKeys 数组和 spaceId 的对象
 * @param thunkAPI Redux Thunk API 对象
 * @returns 包含 spaceId 和更新后的 spaceData 的对象
 */
export const deleteMultipleContentAction = async (
  input: { contentKeys: string[]; spaceId: string },
  thunkAPI: any
) => {
  const { contentKeys, spaceId } = input;
  if (!contentKeys || contentKeys.length === 0) {
    logger.warn("deleteMultipleContentAction called with no contentKeys.");
    return { spaceId, updatedSpaceData: null };
  }
  const { dispatch, getState } = thunkAPI;
  const state = getState();
  const userId = selectUserId(state);

  logger.info(
    { count: contentKeys.length, spaceId, userId },
    "Initiating deleteMultipleContentAction"
  );

  const spaceKey = createSpaceKey.space(spaceId);

  // 1. 获取并检查权限 (仅执行一次)
  const spaceData = (await dispatch(
    read(spaceKey)
  ).unwrap()) as SpaceData | null;
  if (!spaceData) {
    logger.error({ spaceKey }, "Space data not found for batch delete");
    throw new Error("空间不存在");
  }
  if (!userId || !spaceData.members.includes(userId)) {
    logger.warn({ userId, spaceId }, "Unauthorized attempt for batch delete");
    throw new Error("无权修改此空间");
  }

  // 2. 一次性更新 Space 数据 (原子性地删除所有引用)
  // 这是比循环 patch 高效得多的方法
  const changes = {
    contents: contentKeys.reduce(
      (acc, key) => {
        acc[key] = null; // null 表示删除该键
        return acc;
      },
      {} as Record<string, null>
    ),
  };

  try {
    await dispatch(patch({ dbKey: spaceKey, changes })).unwrap();
    logger.info(
      { spaceKey, count: contentKeys.length },
      "Successfully batched patch to remove content references"
    );
  } catch (patchError: any) {
    logger.error(
      { error: patchError, spaceKey },
      "Failed to batch patch space data. Aborting."
    );
    throw new Error(`更新空间引用失败: ${patchError.message}`);
  }

  // 3. 并行删除所有内容实体
  const removePromises = contentKeys.map((key) =>
    dispatch(remove(key)).unwrap()
  );
  const results = await Promise.allSettled(removePromises);

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      logger.info({ contentKey: contentKeys[index] }, "Entity removed");
    } else {
      logger.error(
        { contentKey: contentKeys[index], error: result.reason },
        "Failed to remove an entity"
      );
    }
  });

  // 4. 在所有操作后，获取最终的 Space 数据
  const finalSpaceData = (await dispatch(
    read(spaceKey)
  ).unwrap()) as SpaceData | null;
  logger.info({ spaceId }, "Finished batch delete and refetched space data.");

  return {
    spaceId,
    updatedSpaceData: finalSpaceData,
  };
};
