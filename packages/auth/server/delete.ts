// auth/server/delete.ts
import serverDb, { DB_PREFIX } from "database/server/db";
import {
  logger,
  createErrorResponse,
  createSuccessResponse,
  handleOptionsRequest,
  checkAdminPermission,
} from "./shared";

/**
 * 删除用户及其相关数据
 */
async function deleteUser(userId: string) {
  const userKey = `${DB_PREFIX.USER}${userId}`;

  // 检查用户是否存在
  const exists = await serverDb.get(userKey).catch(() => null);
  if (!exists) {
    throw new Error("User not found");
  }

  logger.debug({ userId }, "Deleting user and related data");

  try {
    // 删除用户数据
    await serverDb.del(userKey);

    // TODO: 删除用户相关数据
    // - 评论
    // - 收藏
    // - 订单
    // - 消息等

    logger.debug({ userId }, "User deletion completed");
  } catch (error) {
    logger.error({
      event: "database_delete_failed",
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * 处理删除用户请求
 */
export async function handleDeleteUser(req: Request, userId: string) {
  if (req.method === "OPTIONS") {
    return handleOptionsRequest();
  }

  const permissionError = checkAdminPermission(req);
  if (permissionError) return permissionError;

  const requestId = Math.random().toString(36).slice(7);
  logger.info({ requestId, userId }, "Processing delete user request");

  try {
    if (!userId) {
      return createErrorResponse("User ID is required", 400);
    }

    await deleteUser(userId);

    logger.info({ requestId, userId }, "User deleted successfully");

    return createSuccessResponse({ success: true });
  } catch (error) {
    logger.error({
      requestId,
      userId,
      event: "delete_user_failed",
      error: error instanceof Error ? error.message : String(error),
    });

    // 使用适当的状态码
    if (error.message === "User not found") {
      return createErrorResponse("User not found", 404);
    }

    return createErrorResponse("Failed to delete user");
  }
}
