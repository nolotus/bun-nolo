// src/create/space/category/deleteCategoryAction.ts (假设路径)
import type { SpaceId, SpaceData } from "create/space/types";
import { selectCurrentUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { read, patch } from "database/dbSlice";
import type { AppDispatch, NoloRootState } from "app/store";
import { checkSpaceMembership } from "../utils/permissions"; // 确认导入路径

export const deleteCategoryAction = async (
  input: { categoryId: string; spaceId: SpaceId },
  thunkAPI: { dispatch: AppDispatch; getState: () => NoloRootState } // 使用具体类型
): Promise<{ spaceId: SpaceId; updatedSpaceData: SpaceData }> => {
  const { categoryId, spaceId } = input;
  const { dispatch, getState } = thunkAPI;
  const state = getState();
  const currentUserId = selectCurrentUserId(state);
  if (!currentUserId) {
    // 添加 userId 检查
    throw new Error("User is not logged in.");
  }

  const spaceKey = createSpaceKey.space(spaceId);

  let spaceData: SpaceData | null;
  try {
    spaceData = await dispatch(read(spaceKey)).unwrap();
  } catch (error: any) {
    // 添加类型注解
    console.error("[ERROR] Read SpaceData failed:", error);
    throw new Error(
      `无法加载空间数据: ${spaceId}, 原因: ${error.message || "未知错误"}`
    );
  }

  // --- 权限检查 ---
  try {
    checkSpaceMembership(spaceData, currentUserId); // 使用提取的函数
  } catch (permissionError: any) {
    // 添加类型注解
    throw new Error(`权限不足，无法删除分类: ${permissionError.message}`);
  }

  if (!spaceData.categories?.[categoryId]) {
    console.warn(
      `[deleteCategoryAction] Category ${categoryId} not found in space ${spaceId}.`
    );
    throw new Error("指定的分类不存在");
  }

  // --- 统一使用 ISO 字符串格式时间戳 ---
  const nowISO = new Date().toISOString();

  const changes: any = {
    // 使用 any 或更具体的类型
    categories: { ...spaceData.categories, [categoryId]: null }, // 标记删除分类
    updatedAt: nowISO, // <--- 添加顶层 updatedAt (使用 ISO 字符串)
  };

  // 处理属于该分类的内容，将 categoryId 清空
  if (spaceData.contents) {
    // 创建一个新的 contents 对象以避免直接修改 state draft (虽然 patch 内部会处理)
    const updatedContents = { ...spaceData.contents };
    let contentsChanged = false; // 标记是否有内容被修改
    Object.keys(updatedContents).forEach((key) => {
      const item = updatedContents[key];
      if (item && item.categoryId === categoryId) {
        // 创建新的 item 对象，更新 categoryId
        updatedContents[key] = { ...item, categoryId: "" };
        contentsChanged = true;
        console.log("[DEBUG] Cleared category for content:", key);
      }
    });
    // 只有当 contents 确实发生改变时才将其加入 changes
    if (contentsChanged) {
      changes.contents = updatedContents;
    }
  }

  let updatedSpaceData: SpaceData;
  try {
    updatedSpaceData = await dispatch(
      patch({ dbKey: spaceKey, changes })
    ).unwrap();
    console.log("[DEBUG] Updated SpaceData:", {
      categories: Object.keys(updatedSpaceData.categories || {}),
      // contents: Object.keys(updatedSpaceData.contents || {}), // 调试时查看
    });
  } catch (error: any) {
    // 添加类型注解
    console.error("[ERROR] Patch Data failed:", error);
    throw new Error(`删除分类失败: ${error.message || "未知错误"}`);
  }

  return { spaceId, updatedSpaceData };
};
