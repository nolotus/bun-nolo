// src/create/space/utils/permissions.ts (新文件)

import type { SpaceData } from "create/space/types"; // 确认类型路径

/**
 * 检查用户是否是指定空间的成员。
 * 如果检查不通过，则抛出错误。
 * @param spaceData - 要检查的空间数据对象，可以为 null。
 * @param userId - 要检查的用户 ID，可以为 null。
 * @throws {Error} 如果空间数据缺失、用户 ID 缺失或用户不是成员。
 */
export const checkSpaceMembership = (
  spaceData: SpaceData | null,
  userId: string | null
): void => {
  if (!spaceData) {
    // 在调用此函数前，通常应该确保 spaceData 已加载
    // 但添加此检查以防万一
    console.error("[Permission Check] Space data is missing.");
    throw new Error("无法执行权限检查：空间数据缺失。");
  }
  if (!userId) {
    console.error("[Permission Check] User ID is missing.");
    throw new Error("无法执行权限检查：用户 ID 缺失。");
  }

  // 检查 members 数组是否存在且包含 userId
  if (
    !spaceData.members ||
    !Array.isArray(spaceData.members) ||
    !spaceData.members.includes(userId)
  ) {
    // 记录警告日志，但抛出统一的、用户友好的错误信息
    console.warn(
      `[Permission Check] User ${userId} attempt to operate on space ${spaceData.id} without membership.`
    );
    throw new Error("当前用户不是空间成员");
  }

  // 未来可以在这里添加更多的权限检查逻辑，例如：
  // if (requiredRole === 'admin' && spaceData.roles[userId] !== 'admin') {
  //     throw new Error("需要管理员权限");
  // }
};

// 你可以在这个文件中添加其他与 Space 权限相关的辅助函数
// export const checkSpaceOwner = (...) => { ... };
