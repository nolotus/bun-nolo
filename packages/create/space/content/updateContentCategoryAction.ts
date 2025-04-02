// 文件路径: src/create/space/actions/updateContentCategoryAction.ts (或你的实际路径)

import type { SpaceId, SpaceData, SpaceContent } from "create/space/types"; // 确认类型路径
import { selectCurrentUserId } from "auth/authSlice"; // 确认导入路径
import { createSpaceKey } from "create/space/spaceKeys"; // 确认导入路径
import { read, patch } from "database/dbSlice"; // 确认导入路径
import type { AppDispatch, NoloRootState } from "app/store"; // 假设 store 类型路径
import { checkSpaceMembership } from "../utils/permissions"; // 导入权限检查函数
// --- 导入常量 ---
import { UNCATEGORIZED_ID } from "create/space/constants"; // 导入代表 UI 未分类容器的常量

/**
 * 异步 Action Thunk，用于更新指定内容的分类。
 * - 如果目标是未分类区域 (通过 UNCATEGORIZED_ID 标识)，则移除内容的 categoryId 属性。
 * - 如果目标是有效分类，则设置内容的 categoryId 为该分类 ID。
 */
export const updateContentCategoryAction = async (
  // --- 修改: 输入类型明确为 string，代表目标容器 ID ---
  //   这个 ID 可以是真实的分类 ID，也可以是 UNCATEGORIZED_ID 常量
  input: { spaceId: SpaceId; contentKey: string; categoryId: string },
  thunkAPI: { dispatch: AppDispatch; getState: () => NoloRootState } // 使用明确类型
): Promise<{ spaceId: SpaceId; updatedSpaceData: SpaceData }> => {
  // --- 重命名 categoryId 为 targetContainerId 以更清晰地表达其含义 ---
  const { spaceId, contentKey, categoryId: targetContainerId } = input;
  const { dispatch, getState } = thunkAPI;
  const state = getState();
  const userId = selectCurrentUserId(state);

  // --- 基本输入验证 ---
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
  // targetContainerId 必须是字符串 (普通分类 ID 或 UNCATEGORIZED_ID)
  if (typeof targetContainerId !== "string") {
    // 如果允许 null/undefined，需要调整类型和后续逻辑
    // 但基于拖拽目标通常是字符串 ID，这里强制为 string
    throw new Error("Invalid target container ID provided (must be a string).");
  }

  const spaceKey = createSpaceKey.space(spaceId);
  let spaceData: SpaceData | null = null;
  try {
    spaceData = await dispatch(read(spaceKey)).unwrap();
  } catch (readError: any) {
    console.error(
      `[updateContentCategoryAction] Failed to read space data for key ${spaceKey}:`,
      readError
    );
    throw new Error(
      `无法加载空间数据: ${spaceId}, 原因: ${readError.message || "未知错误"}`
    );
  }

  // --- 权限和存在性检查 ---
  try {
    checkSpaceMembership(spaceData, userId); // 使用权限检查函数
  } catch (permissionError: any) {
    throw new Error(`权限不足，无法修改内容分类: ${permissionError.message}`);
  }

  const currentContent = spaceData?.contents?.[contentKey]; // 获取当前内容
  if (!currentContent) {
    console.warn(
      `[updateContentCategoryAction] Content ${contentKey} not found in space ${spaceId}.`
    );
    throw new Error("Content not found");
  }

  // --- 检查目标分类的有效性 (如果不是移到未分类) ---
  // 仅当目标不是 UNCATEGORIZED_ID 常量时，才需要验证目标分类是否存在
  if (targetContainerId !== UNCATEGORIZED_ID) {
    if (!spaceData.categories?.[targetContainerId]) {
      // 目标分类不存在或无效 (值为 null)
      console.warn(
        `[updateContentCategoryAction] Target category ${targetContainerId} not found or invalid in space ${spaceId}. Cannot move content.`
      );
      throw new Error("Target category not found or is invalid");
      // 也可以选择不抛错，直接忽略本次操作，但抛错更明确
    }
    // 如果目标分类有效，则继续
  }
  // 如果目标是 UNCATEGORIZED_ID，则无需检查分类是否存在

  // --- 构造 Patch Changes 对象 (核心修改) ---
  const now = Date.now(); // 使用 number 时间戳

  // 1. 确定要在 patch 中使用的 categoryId 值
  //    - 如果目标是未分类容器，使用 null 指令来删除属性
  //    - 否则，使用目标容器 ID (也就是目标分类 ID)
  const categoryIdValueForPatch =
    targetContainerId === UNCATEGORIZED_ID ? null : targetContainerId;

  // 2. 检查内容当前的 categoryId 是否真的需要改变
  //    - 获取当前内容的 categoryId (可能是 undefined)
  const currentCategoryId = currentContent.categoryId;
  //    - 比较目标 patch 值与当前值
  //    - 注意: 如果当前是 undefined 且目标 patch 值是 null，也视为不需要改变（已经是未分类）
  let needsUpdate = true;
  if (categoryIdValueForPatch === null && currentCategoryId === undefined) {
    needsUpdate = false; // 已经是未分类，无需发送 patch 删除指令
  } else if (categoryIdValueForPatch === currentCategoryId) {
    needsUpdate = false; // 目标分类与当前分类相同
  }

  // 3. 如果确实需要更新，才构造 changes 对象
  let changes: Partial<Pick<SpaceData, "contents" | "updatedAt">> | null = null; // 初始化为 null
  if (needsUpdate) {
    changes = {
      contents: {
        // 使用动态键更新指定的 contentKey
        [contentKey]: {
          // --- 修改: 使用计算出的 categoryIdValueForPatch ---
          categoryId: categoryIdValueForPatch, // null 或 目标分类 ID
          updatedAt: now, // 更新内容的 updatedAt
        },
      },
      updatedAt: now, // 更新顶层的 updatedAt
    };
  } else {
    console.log(
      `[updateContentCategoryAction] No category change needed for ${contentKey}. Skipping patch.`
    );
    // 如果不需要更新，直接返回当前数据即可
    return { spaceId, updatedSpaceData: spaceData };
  }

  // --- 执行 Patch 更新 (仅在需要更新时执行) ---
  let updatedSpaceData: SpaceData;
  try {
    // 只有当 changes 不为 null 时才 dispatch patch
    updatedSpaceData = await dispatch(
      patch({ dbKey: spaceKey, changes: changes! }) // 使用非空断言，因为已检查
    ).unwrap();
  } catch (patchError: any) {
    console.error(
      `[updateContentCategoryAction] Failed to patch space data for key ${spaceKey}:`,
      patchError
    );
    throw new Error(`更新内容分类失败: ${patchError.message || "未知错误"}`);
  }

  // --- 返回结果 ---
  return { spaceId, updatedSpaceData };
};
