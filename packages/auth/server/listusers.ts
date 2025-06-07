// auth/server/listusers.ts
import serverDb from "database/server/db";
import {
  createErrorResponse,
  createSuccessResponse,
  handleOptionsRequest,
  checkAdminPermission,
} from "./shared";
import { DB_PREFIX } from "database/keys";

interface ListUsersOptions {
  page?: number;
  pageSize?: number;
  // 模糊搜索关键字：会在 id/username/email 上做包含匹配
  search?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  createdAt: string;
  [key: string]: any;
}

async function listUsers({
  page = 1,
  pageSize = 10,
  search,
}: ListUsersOptions = {}) {
  const prefix = DB_PREFIX.USER;
  let users: User[] = [];

  // 1. 全量读取到内存
  const iter = serverDb.iterator({
    gt: prefix,
    lt: prefix + "\xFF",
  });
  try {
    for await (const [key, value] of iter) {
      const id = key.slice(prefix.length);
      users.push({
        id,
        username: value.username,
        email: value.email || "",
        balance: value.balance || 0,
        createdAt: value.createdAt,
        ...value,
      });
    }
  } finally {
    await iter.close();
  }

  // 2. 按创建时间降序
  users.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // 3. 如果有 search 参数，先做一次过滤
  if (search) {
    const kw = search.toLowerCase();
    users = users.filter(
      (u) =>
        u.id.toLowerCase().includes(kw) ||
        u.username.toLowerCase().includes(kw) ||
        u.email.toLowerCase().includes(kw)
    );
  }

  // 4. 分页
  const totalCount = users.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const start = (page - 1) * pageSize;
  const list = users.slice(start, start + pageSize);

  return {
    total: totalCount,
    list,
    currentPage: page,
    totalPages,
    hasMore: page < totalPages,
  };
}

export async function handleListUsers(req: Request) {
  if (req.method === "OPTIONS") {
    return handleOptionsRequest();
  }
  const { userId: actionUserId } = req.user;
  const permissionError = checkAdminPermission(actionUserId);
  if (permissionError) return permissionError;

  try {
    const url = new URL(req.url);
    // 1. 解析并限制分页参数
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(url.searchParams.get("pageSize") || "10", 10))
    );

    // 2. 解析搜索参数
    const userIdParam = url.searchParams.get("userId")?.trim();
    const searchParam = url.searchParams.get("search")?.trim();

    const prefix = DB_PREFIX.USER;

    // 3. 如果指定了 userId，直接单条查询
    if (userIdParam) {
      try {
        const value = await serverDb.get(prefix + userIdParam);
        const user: User = {
          id: userIdParam,
          username: value.username,
          email: value.email || "",
          balance: value.balance || 0,
          createdAt: value.createdAt,
          ...value,
        };
        return createSuccessResponse({
          total: 1,
          list: [user],
          currentPage: 1,
          totalPages: 1,
          hasMore: false,
        });
      } catch (err: any) {
        // key not found 时返回空列表
        if (err.notFound) {
          return createSuccessResponse({
            total: 0,
            list: [],
            currentPage: 1,
            totalPages: 1,
            hasMore: false,
          });
        }
        throw err;
      }
    }

    // 4. 否则走分页 + （可选）关键字搜索
    const result = await listUsers({
      page,
      pageSize,
      search: searchParam || undefined,
    });
    return createSuccessResponse(result);
  } catch (error) {
    return createErrorResponse("Internal server error");
  }
}
