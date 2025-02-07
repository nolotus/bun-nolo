import serverDb, { DB_PREFIX } from "database/server/db";

import { DataType } from "create/types";
import { createTokenKey, createTokenStatsKey, createKey } from "database/keys";
import {
  createErrorResponse,
  createSuccessResponse,
  handleOptionsRequest,
  checkAdminPermission,
} from "./shared";

async function deleteUserRelatedData(userId: string) {
  const batch = serverDb.batch();

  try {
    // 1. 删除对话和消息
    for await (const [key] of serverDb.iterator({
      gte: createKey(DataType.DIALOG, userId),
      lte: createKey(DataType.DIALOG, userId, "\xFF"),
    })) {
      const dialogId = key.split(":")[2];

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
  } catch (error) {
    throw error;
  }
}

async function deleteUser(userId: string) {
  const userKey = `${DB_PREFIX.USER}${userId}`;
  const exists = await serverDb.get(userKey).catch(() => null);
  if (!exists) {
    throw new Error("User not found");
  }

  try {
    await deleteUserRelatedData(userId);
    await serverDb.del(userKey);
  } catch (error) {
    throw error;
  }
}

export async function handleDeleteUser(req: Request, userId: string) {
  if (req.method === "OPTIONS") {
    return handleOptionsRequest();
  }
  const { userId: actionUserId } = req.user;

  const permissionError = checkAdminPermission(actionUserId);
  if (permissionError) return permissionError;

  try {
    if (!userId) {
      return createErrorResponse("User ID is required", 400);
    }

    await deleteUser(userId);
    return createSuccessResponse({ success: true });
  } catch (error) {
    if (error.message === "User not found") {
      return createErrorResponse("User not found", 404);
    }
    return createErrorResponse("Failed to delete user");
  }
}
