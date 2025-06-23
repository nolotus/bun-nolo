// 文件路径: create/space/category/deleteCategoryAction.ts (或你的实际路径)

import type {
  SpaceId,
  SpaceData,
  Category,
  Contents,
  SpaceContent, // 导入 SpaceContent
} from "create/space/types"; // 确认类型路径
import { selectUserId } from "auth/authSlice"; // 确认导入路径
import { createSpaceKey } from "create/space/spaceKeys"; // 确认导入路径
import { read, patch } from "database/dbSlice"; // 确认导入路径
import type { AppDispatch, RootState } from "app/store"; // 假设 store 类型路径
import { checkSpaceMembership } from "../utils/permissions"; // 导入权限检查函数
// --- 移除 UNCATEGORIZED_ID 导入，因为它不再用于此文件的核心逻辑 ---
// import { UNCATEGORIZED_ID } from "create/space/constants";

// Patch 类型定义
type SpacePatchChanges = Partial<
  Pick<SpaceData, "categories" | "contents" | "updatedAt">
>;

/**
 * 异步 Action Thunk，用于删除一个分类。
 * 1. 将分类定义在 `SpaceData.categories` 中标记为 null (用于 deepMerge 删除)。
 * 2. 遍历所有内容：
 *    - 将属于被删除分类的内容的 categoryId 移除 (通过发送 categoryId: null patch)。
 *    - 将 categoryId 为 "" (旧格式未分类) 的内容的 categoryId 移除 (自动修正)。
 */
export const deleteCategoryAction = async (
  input: { categoryId: string; spaceId: SpaceId },
  thunkAPI: { dispatch: AppDispatch; getState: () => RootState }
): Promise<{ spaceId: SpaceId; updatedSpaceData: SpaceData }> => {
  const { categoryId, spaceId } = input;
  const { dispatch, getState } = thunkAPI;
  const state = getState();
  const currentUserId = selectUserId(state);

  // --- 1. 输入和状态验证 ---
  if (!currentUserId) {
    throw new Error("User is not logged in.");
  }
  // categoryId 必须是有效的、非空的字符串，因为我们要删除一个具体的分类
  if (!categoryId || typeof categoryId !== "string" || !categoryId.trim()) {
    throw new Error("Invalid categoryId provided for deletion.");
  }
  // --- 移除对 UNCATEGORIZED_ID 的检查 ---
  // 不允许删除代表“未分类”状态的 UI 标识符

  const spaceKey = createSpaceKey.space(spaceId);

  // --- 2. 读取数据 ---
  let spaceData: SpaceData | null;
  try {
    spaceData = await dispatch(read(spaceKey)).unwrap();
  } catch (error: any) {
    console.error(
      `[deleteCategoryAction] Read SpaceData failed for key ${spaceKey}:`,
      error
    );
    throw new Error(
      `无法加载空间数据: ${spaceId}, 原因: ${error.message || "未知错误"}`
    );
  }

  // --- 3. 权限检查 ---
  try {
    checkSpaceMembership(spaceData, currentUserId);
  } catch (permissionError: any) {
    throw new Error(`权限不足，无法删除分类: ${permissionError.message}`);
  }

  // --- 4. 分类存在性检查 ---
  if (!spaceData?.categories?.[categoryId]) {
    console.warn(
      `[deleteCategoryAction] Category ${categoryId} not found or already deleted in space ${spaceId}. Action Aborted.`
    );
    throw new Error("指定的分类不存在或已被删除");
  }

  // --- 5. 构建基础更新 (删除分类定义 + 更新顶层时间戳) ---
  const now = Date.now(); // 使用 number 时间戳
  const changes: SpacePatchChanges = {
    // 指令：删除 categories 对象中键为 categoryId 的条目
    categories: { [categoryId]: null },
    updatedAt: now, // 更新整个 Space 的时间戳
  };

  // --- 6. 处理关联内容 (核心修改：移除分类 + 自动修正 "") ---
  if (spaceData.contents) {
    // 创建一个只包含需要 *修改* 的内容的 patch 对象
    const contentsPatch: Record<string, Partial<SpaceContent> | null> = {};
    let contentsChanged = false; // 标记是否有内容被修改

    Object.keys(spaceData.contents).forEach((key) => {
      const item = spaceData.contents![key]; // 使用非空断言
      if (item) {
        // 确保内容项存在且未被删除 (虽然理论上 patch 会处理 null)
        let needsCategoryIdRemoval = false;

        // 条件一：内容属于正在被删除的分类
        if (item.categoryId === categoryId) {
          needsCategoryIdRemoval = true;
        }
        // 条件二：内容是旧格式的未分类 ("")，顺便修正
        else if (item.categoryId === "") {
          needsCategoryIdRemoval = true;
        }

        // 如果满足任一条件，则需要生成 patch 来移除 categoryId
        if (needsCategoryIdRemoval) {
          contentsPatch[key] = {
            categoryId: null, // 指令：删除 categoryId 属性
            updatedAt: now, // 更新该内容的时间戳
          };
          contentsChanged = true;
        }
      }
    });

    // 如果确实有内容需要更新，则将 contentsPatch 添加到主 changes 对象中
    if (contentsChanged) {
      changes.contents = contentsPatch;
    }
  }

  // --- 7. 执行 Patch 更新 ---
  let updatedSpaceDataResult: SpaceData;
  try {
    // changes 对象现在包含了删除分类的指令，以及所有需要移除 categoryId 的内容的最小化 patch
    updatedSpaceDataResult = await dispatch(
      patch({ dbKey: spaceKey, changes })
    ).unwrap();
  } catch (error: any) {
    console.error(
      `[deleteCategoryAction] Patch Data failed for key ${spaceKey}:`,
      error
    );
    throw new Error(`删除分类失败: ${error.message || "未知错误"}`);
  }

  // --- 8. 返回结果 ---
  return { spaceId, updatedSpaceData: updatedSpaceDataResult };
};
