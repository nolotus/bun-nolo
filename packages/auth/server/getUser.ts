// auth/server/getUser.ts
import serverDb from "database/server/db";
import {
  createErrorResponse,
  createSuccessResponse,
  handleOptionsRequest,
} from "./shared";
import { nolotusId } from "core/init";
import { DB_PREFIX } from "database/keys";

interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  createdAt: string;
  [key: string]: any;
}

// 权限检查工具函数，复用性更强
function canViewUserProfile(
  requestUserId: string | undefined,
  targetUserId: string
) {
  if (!requestUserId) return false;
  return requestUserId === targetUserId || requestUserId === nolotusId;
}

export async function getUser(userId: string): Promise<User | null> {
  const key = `${DB_PREFIX.USER}${userId}`;

  try {
    const userData = await serverDb.get(key);
    if (!userData) return null;

    return {
      id: userId,
      username: userData.username,
      email: userData.email || "",
      balance: userData.balance || 0,
      createdAt: userData.createdAt,
      ...userData,
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch user: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function handleGetUser(req: Request, userId: string) {
  if (req.method === "OPTIONS") {
    return handleOptionsRequest();
  }

  try {
    // 权限检查
    if (!canViewUserProfile(req.user?.userId, userId)) {
      return createErrorResponse("Unauthorized: Insufficient permissions", 403);
    }

    const user = await getUser(userId);
    if (!user) {
      return createErrorResponse("User not found", 404);
    }

    return createSuccessResponse(user);
  } catch (error) {
    return createErrorResponse("Internal server error");
  }
}
