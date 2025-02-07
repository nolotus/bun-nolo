// auth/server/listusers.ts
import serverDb, { DB_PREFIX } from "database/server/db";
import {
  createErrorResponse,
  createSuccessResponse,
  handleOptionsRequest,
  checkAdminPermission,
} from "./shared";

interface ListUsersOptions {
  page?: number;
  pageSize?: number;
}

interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  createdAt: string;
  [key: string]: any;
}

async function listUsers({ page = 1, pageSize = 10 }: ListUsersOptions = {}) {
  const prefix = DB_PREFIX.USER;
  let totalCount = 0;
  const users: User[] = [];

  // Count total users
  const countIterator = serverDb.iterator({
    gt: prefix,
    lt: prefix + "\xFF",
    values: false,
  });

  try {
    for await (const key of countIterator) totalCount++;
  } finally {
    await countIterator.close();
  }

  // Get paginated users
  const dataIterator = serverDb.iterator({
    gt: prefix,
    lt: prefix + "\xFF",
  });

  try {
    let skipped = 0;
    const skip = (page - 1) * pageSize;

    for await (const [key, value] of dataIterator) {
      if (skipped < skip) {
        skipped++;
        continue;
      }

      if (users.length >= pageSize) break;

      const userId = key.slice(prefix.length);
      users.push({
        id: userId,
        username: value.username,
        email: value.email || "",
        balance: value.balance || 0,
        createdAt: value.createdAt,
        ...value,
      });
    }

    return {
      total: totalCount,
      list: users,
      currentPage: page,
      totalPages: Math.ceil(totalCount / pageSize),
      hasMore: totalCount > page * pageSize,
    };
  } finally {
    await dataIterator.close();
  }
}

export async function handleListUsers(req: Request) {
  if (req.method === "OPTIONS") {
    return handleOptionsRequest();
  }
  const { userId: actionUserId } = req.user;

  const permissionError = checkAdminPermission(actionUserId);
  if (permissionError) return permissionError;

  try {
    // 从查询参数中获取分页信息
    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(url.searchParams.get("pageSize") || "10"))
    );

    const result = await listUsers({ page, pageSize });

    return createSuccessResponse(result);
  } catch (error) {
    return createErrorResponse("Internal server error");
  }
}
