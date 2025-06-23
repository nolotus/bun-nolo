// 文件路径: create/space/content/moveContentAction.ts

import type { AppDispatch, RootState } from "app/store"; // 确认 store 类型路径
import type { SpaceId, SpaceContent, SpaceData } from "create/space/types"; // 确认类型路径
import { selectUserId } from "auth/authSlice"; // 确认导入路径
import { createSpaceKey } from "create/space/spaceKeys"; // 确认导入路径
// 假设 dbSlice 提供 read, patch
import { read, patch } from "database/dbSlice"; // 确认导入路径
import { checkSpaceMembership } from "../utils/permissions"; // 导入权限检查函数 (假设存在)
import { UNCATEGORIZED_ID } from "create/space/constants"; // 导入常量
import pino from "pino"; // 引入日志

const logger = pino({
  level: "info", // 或根据环境调整
  transport: { target: "pino-pretty" },
});

// 定义移动操作的输入类型
interface MoveContentInput {
  contentKey: string; // 要移动的内容的 Key
  sourceSpaceId: SpaceId; // 源空间的 ID
  targetSpaceId: SpaceId; // 目标空间的 ID
  targetCategoryId?: string | null; // 目标空间中的分类 ID (可选, null/undefined/""/UNCATEGORIZED_ID 表示无分类)
}

// 定义返回类型，包含两个更新后的空间数据或 null (如果读取失败) 及可选错误
interface MoveContentResult {
  sourceSpaceId: SpaceId;
  updatedSourceSpaceData: SpaceData | null;
  targetSpaceId: SpaceId;
  updatedTargetSpaceData: SpaceData | null;
  error?: string; // 可选的错误信息传递
}

/**
 * 异步 Action Thunk，用于在两个 Space 之间移动内容项的引用。
 * 它会：
 * 1. 从源 Space 的 `contents` 中移除引用 (通过 patch)。
 * 2. 将内容的引用添加到目标 Space 的 `contents` 中 (通过 patch)，并根据 targetCategoryId 更新分类。
 * 3. 不直接修改内容实体本身，假设实体数据在移动中保持不变，只改变引用位置和分类。
 * 4. 处理 categoryId 逻辑，使其与 addContentAction 一致（未分类则不存储 categoryId 属性）。
 */
export const moveContentAction = async (
  input: MoveContentInput,
  thunkAPI: { dispatch: AppDispatch; getState: () => RootState }
): Promise<MoveContentResult> => {
  const {
    contentKey,
    sourceSpaceId,
    targetSpaceId,
    targetCategoryId: rawTargetCategoryId,
  } = input;
  const { dispatch, getState } = thunkAPI;
  const state = getState();
  const userId = selectUserId(state);
  const now = Date.now(); // 用于更新时间戳

  logger.info({ ...input, userId }, "Initiating moveContentAction");

  // --- 1. 基本验证 ---
  if (!userId) {
    logger.error("User not logged in.");
    throw new Error("用户未登录");
  }
  if (sourceSpaceId === targetSpaceId) {
    logger.error("Source and target space IDs are the same.");
    throw new Error(
      "源空间和目标空间不能相同。如需修改分类，请使用更新分类操作。"
    );
  }
  if (
    !contentKey ||
    typeof contentKey !== "string" ||
    contentKey.trim() === ""
  ) {
    logger.error("Invalid contentKey provided.");
    throw new Error("无效的内容 Key。");
  }

  let sourceSpaceData: SpaceData | null = null;
  let targetSpaceData: SpaceData | null = null;
  let contentDataFromSource: SpaceContent | null = null; // 从源空间获取内容引用数据
  let finalSourceData: SpaceData | null = null;
  let finalTargetData: SpaceData | null = null;
  let overallError: string | undefined = undefined;

  try {
    // --- 2. 并行读取源和目标空间数据 ---
    const sourceSpaceKey = createSpaceKey.space(sourceSpaceId);
    const targetSpaceKey = createSpaceKey.space(targetSpaceId);

    logger.info(
      { sourceSpaceKey, targetSpaceKey },
      "Reading source and target space data."
    );

    const [sourceResult, targetResult] = await Promise.allSettled([
      dispatch(read(sourceSpaceKey)).unwrap(),
      dispatch(read(targetSpaceKey)).unwrap(),
    ]);

    // 处理源空间读取结果
    if (sourceResult.status === "rejected" || !sourceResult.value) {
      const reason =
        sourceResult.status === "rejected"
          ? sourceResult.reason
          : "Data is null";
      throw new Error(
        `无法加载源空间 (${sourceSpaceId}): ${reason?.message || reason}`
      );
    }
    sourceSpaceData = sourceResult.value as SpaceData;

    // 处理目标空间读取结果
    if (targetResult.status === "rejected" || !targetResult.value) {
      const reason =
        targetResult.status === "rejected"
          ? targetResult.reason
          : "Data is null";
      throw new Error(
        `无法加载目标空间 (${targetSpaceId}): ${reason?.message || reason}`
      );
    }
    targetSpaceData = targetResult.value as SpaceData;

    // --- 3. 权限检查 ---
    logger.info("Checking permissions for source and target spaces.");
    checkSpaceMembership(sourceSpaceData, userId); // 会在失败时抛出错误
    checkSpaceMembership(targetSpaceData, userId); // 会在失败时抛出错误

    // --- 4. 检查内容是否存在于源空间 ---
    if (!sourceSpaceData.contents || !sourceSpaceData.contents[contentKey]) {
      logger.error(
        { contentKey, sourceSpaceId },
        "Content key not found in source space contents."
      );
      throw new Error(
        `内容 (${contentKey}) 不在源空间 (${sourceSpaceId}) 中。`
      );
    }
    contentDataFromSource = sourceSpaceData.contents[contentKey]; // 获取要移动的内容数据

    // 可选：检查目标空间是否已存在同名 Key
    if (targetSpaceData.contents && targetSpaceData.contents[contentKey]) {
      logger.warn(
        { contentKey, targetSpaceId },
        "Content key already exists in target space. Overwriting."
      );
      // 根据产品需求决定是报错还是覆盖，这里选择覆盖
    }

    // --- 5. 确定最终用于目标存储的 categoryId (string | undefined) ---
    let categoryIdForTargetStorage: string | undefined;
    if (
      rawTargetCategoryId &&
      rawTargetCategoryId !== "" &&
      rawTargetCategoryId !== UNCATEGORIZED_ID
    ) {
      // 验证目标分类 ID 是否在目标空间中有效
      if (targetSpaceData.categories?.[rawTargetCategoryId]) {
        categoryIdForTargetStorage = rawTargetCategoryId;
      } else {
        logger.warn(
          `Target category ${rawTargetCategoryId} not found in target space ${targetSpaceId}. Content will be uncategorized.`
        );
        categoryIdForTargetStorage = undefined; // 无效则降级
      }
    } else {
      categoryIdForTargetStorage = undefined; // 空、null、undefined 或常量均视为未分类
    }

    // --- 6. 构造添加到目标空间的内容引用对象 ---
    // 继承源引用的属性，并更新 categoryId 和 updatedAt
    const contentReferenceForTarget: SpaceContent = {
      ...contentDataFromSource,
      updatedAt: now,
    };
    // 先删除旧的 categoryId (无论是否存在)，再根据需要添加新的
    delete (contentReferenceForTarget as Partial<SpaceContent>).categoryId;
    if (categoryIdForTargetStorage !== undefined) {
      contentReferenceForTarget.categoryId = categoryIdForTargetStorage;
    }

    // --- 7. 准备 Patch Changes ---
    const sourcePatchChanges = {
      contents: {
        [contentKey]: null, // 从源移除引用 (null value in patch typically means delete key)
      },
      updatedAt: now,
    };
    const targetPatchChanges = {
      contents: {
        [contentKey]: contentReferenceForTarget, // 向目标添加（或覆盖）引用
      },
      updatedAt: now,
    };

    // --- 8. 并行执行两个 Patch 更新 ---
    logger.info("Patching source and target space data.");
    await Promise.all([
      dispatch(
        patch({ dbKey: sourceSpaceKey, changes: sourcePatchChanges })
      ).unwrap(),
      dispatch(
        patch({ dbKey: targetSpaceKey, changes: targetPatchChanges })
      ).unwrap(),
    ]);
    logger.info("Successfully patched both source and target spaces.");
  } catch (error: any) {
    logger.error(
      { error: error.message, stack: error.stack },
      "Error during move content action execution."
    );
    overallError = error.message || "移动内容时发生未知错误";
    // 不再继续，将在 finally 块中尝试读取并返回
  } finally {
    // --- 9. 无论成功与否，都尝试重新读取最终的空间数据 ---
    // (如果中途出错，可能只有一个或两个空间被更新，读取可以反映部分成功的状态)
    logger.info("Attempting to re-read final space data.");
    const sourceSpaceKey = createSpaceKey.space(sourceSpaceId);
    const targetSpaceKey = createSpaceKey.space(targetSpaceId);

    const [finalSourceResult, finalTargetResult] = await Promise.allSettled([
      dispatch(read(sourceSpaceKey)).unwrap(),
      dispatch(read(targetSpaceKey)).unwrap(),
    ]);

    if (finalSourceResult.status === "fulfilled") {
      finalSourceData = finalSourceResult.value as SpaceData;
    } else {
      logger.error(
        { sourceSpaceId, reason: finalSourceResult.reason },
        "Failed to re-read final source space data."
      );
    }

    if (finalTargetResult.status === "fulfilled") {
      finalTargetData = finalTargetResult.value as SpaceData;
    } else {
      logger.error(
        { targetSpaceId, reason: finalTargetResult.reason },
        "Failed to re-read final target space data."
      );
    }

    logger.info(
      {
        hasError: !!overallError,
        sourceReadSuccess: !!finalSourceData,
        targetReadSuccess: !!finalTargetData,
      },
      "Move content action finished."
    );

    // --- 10. 返回结果 ---
    const result: MoveContentResult = {
      sourceSpaceId,
      updatedSourceSpaceData: finalSourceData,
      targetSpaceId,
      updatedTargetSpaceData: finalTargetData,
      error: overallError, // 如果过程中有错误，则传递错误信息
    };

    // 如果在主 try 块中捕获到错误，重新抛出，让 Thunk 进入 rejected 状态
    // 否则，返回成功结果（即使最终读取失败，操作本身可能成功）
    if (overallError) {
      // 可以选择性地返回部分成功的数据，或者直接抛出错误
      // throw new Error(overallError); // 这会使 Thunk rejected
      // 或者，像现在这样，在返回对象中包含错误信息，让 reducer 处理 fulfilled 状态
      return result;
    }

    return result;
  }
};
