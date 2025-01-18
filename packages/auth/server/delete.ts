// auth/server/delete.ts
import serverDb, { DB_PREFIX } from "database/server/db";

import { DataType } from "create/types";
import { createTokenKey, createTokenStatsKey, createKey } from "database/keys";
import {
  logger,
  createErrorResponse,
  createSuccessResponse,
  handleOptionsRequest,
  checkAdminPermission,
} from "./shared";

/**
 * 删除用户相关的所有数据
 */
async function deleteUserRelatedData(userId: string) {
  logger.debug({ userId }, "Starting to delete user related data");

  const batch = serverDb.batch();

  try {
    // 1. 删除对话和消息
    for await (const [key] of serverDb.iterator({
      gte: createKey(DataType.DIALOG, userId),
      lte: createKey(DataType.DIALOG, userId, "\xFF"),
    })) {
      const dialogId = key.split(":")[2]; // 从key中提取dialogId

      // 删除对话消息
      for await (const [msgKey] of serverDb.iterator({
        gte: createKey(DataType.DIALOG, dialogId, "msg"),
        lte: createKey(DataType.DIALOG, dialogId, "msg", "\xFF"),
      })) {
        batch.del(msgKey);
      }

      batch.del(key);
    }

    // 2. 删除Token相关数据
    const now = Date.now();
    for await (const [key] of serverDb.iterator({
      gte: createTokenStatsKey(userId, ""),
      lte: createTokenStatsKey(userId, "\xFF"),
    })) {
      batch.del(key);
    }

    for await (const [key] of serverDb.iterator({
      gte: createTokenKey.record(userId, 0),
      lte: createTokenKey.record(userId, now),
    })) {
      batch.del(key);
    }

    // 3. 删除其他独立数据
    for await (const [key] of serverDb.iterator({
      gte: createKey(DataType.CYBOT, userId),
      lte: createKey(DataType.CYBOT, userId, "\xFF"),
    })) {
      batch.del(key);
    }

    for await (const [key] of serverDb.iterator({
      gte: createKey(DataType.PAGE, userId),
      lte: createKey(DataType.PAGE, userId, "\xFF"),
    })) {
      batch.del(key);
    }

    await batch.write();

    logger.debug({ userId }, "User related data deletion completed");
  } catch (error) {
    logger.error({
      event: "delete_related_data_failed",
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

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
    // 先删除相关数据
    await deleteUserRelatedData(userId);

    // 最后删除用户数据
    await serverDb.del(userKey);

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

    if (error.message === "User not found") {
      return createErrorResponse("User not found", 404);
    }

    return createErrorResponse("Failed to delete user");
  }
}
