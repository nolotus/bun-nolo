// auth/server/disable.ts
import serverDb from "database/server/db";
import { DB_PREFIX } from "database/keys";
import {
  createErrorResponse,
  createSuccessResponse,
  handleOptionsRequest,
  checkAdminPermission,
} from "./shared";

async function disableUser(userId: string) {
  const userKey = `${DB_PREFIX.USER}${userId}`;
  const userData = await serverDb.get(userKey).catch(() => null);

  if (!userData) {
    throw new Error("User not found");
  }

  try {
    // 更新用户数据，设置停用状态
    const updatedUserData = {
      ...userData,
      isDisabled: true,
      disabledAt: new Date().toISOString(), // 记录停用时间，可选
    };
    await serverDb.put(userKey, updatedUserData);
  } catch (error) {
    throw error;
  }
}

export async function handleDisableUser(req: Request, userId: string) {
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

    await disableUser(userId);
    return createSuccessResponse({ success: true });
  } catch (error) {
    if (error.message === "User not found") {
      return createErrorResponse("User not found", 404);
    }
    return createErrorResponse("Failed to disable user");
  }
}
