import serverDb, { DB_PREFIX } from "database/server/db";
import pino from "pino";

const logger = pino();
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

/**
 * 处理获取用户列表请求
 */
// database/server/handlers.ts
export async function handleListUsers(req) {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const requestId = Math.random().toString(36).slice(7);
  logger.info({ requestId, url: req.url }, "Processing list users request");

  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(req.query.pageSize) || 10)
    );

    const result = await listUsers({ page, pageSize });

    logger.info(
      {
        requestId,
        total: result.total,
        page: result.currentPage,
        pageSize,
        returnedCount: result.list.length,
      },
      "Users retrieved successfully"
    );

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (error) {
    // ... error handling
  }
}

/**
 * 分页查询用户列表
 * @returns {Promise<{total: number, list: Array<{id: string, ...rest}>, currentPage: number}>}
 */
// database/server/users.ts
async function listUsers({ page = 1, pageSize = 10 } = {}) {
  let totalCount = 0;
  const users = [];
  const prefix = DB_PREFIX.USER;

  // 首先获取总数
  const countIterator = serverDb.iterator({
    gt: prefix,
    lt: prefix + "\xFF",
    values: false, // 只获取keys以提升性能
  });

  try {
    for await (const key of countIterator) {
      totalCount++;
    }
  } finally {
    await countIterator.close();
  }

  // 然后获取分页数据
  const dataIterator = serverDb.iterator({
    gt: prefix,
    lt: prefix + "\xFF",
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  try {
    for await (const [key, value] of dataIterator) {
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

    logger.debug(
      {
        page,
        pageSize,
        totalCount,
        returnedCount: users.length,
      },
      "Users query completed"
    );

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
