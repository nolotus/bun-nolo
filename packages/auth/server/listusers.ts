import serverDb, { DB_PREFIX } from "database/server/db";

/**
 * 处理获取用户列表请求
 * @param {Request} req 请求对象
 * @returns {Promise<Response>}
 */
/**
 * 处理获取用户列表请求
 * @param {Request} req 请求对象
 * @returns {Promise<Response>}
 */
export async function handleListUsers(req) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);

  // 添加 CORS 响应头
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*", // 允许所有来源，生产环境建议设置具体域名
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  // 处理 OPTIONS 预检请求
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  console.log({
    level: "info",
    event: "list_users_start",
    requestId,
    message: "Starting to process list users request",
    url: req.url,
  });

  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const pageSize = parseInt(url.searchParams.get("pageSize")) || 10;

    console.log({
      level: "debug",
      event: "list_users_params",
      requestId,
      message: "Processing with parameters",
      page,
      pageSize,
    });

    const result = await listUsers({ page, pageSize });
    const duration = Date.now() - startTime;

    console.log({
      level: "info",
      event: "list_users_success",
      requestId,
      message: "Successfully retrieved user list",
      duration,
      totalUsers: result.total,
      page: result.currentPage,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    console.error({
      level: "error",
      event: "list_users_error",
      requestId,
      message: "Failed to fetch users",
      error: error.message,
      stack: error.stack,
      duration,
    });

    return new Response(JSON.stringify({ error: "Failed to fetch users" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

/**
 * 分页查询用户列表
 * @param {Object} options 查询选项
 * @param {number} options.page 页码，从1开始
 * @param {number} options.pageSize 每页数量
 * @returns {Promise<{total: number, list: Array, currentPage: number}>}
 */
async function listUsers({ page = 1, pageSize = 10 } = {}) {
  const startTime = Date.now();
  const operationId = Math.random().toString(36).substring(7);

  console.log({
    level: "debug",
    event: "db_query_start",
    operationId,
    message: "Starting database query",
    page,
    pageSize,
  });

  const prefix = DB_PREFIX.USER;
  const users = [];
  let count = 0;
  const start = (page - 1) * pageSize;

  const iterator = serverDb.iterator({
    gt: prefix,
    lt: prefix + "\xFF",
  });

  try {
    for await (const [key, value] of iterator) {
      if (count >= start && users.length < pageSize) {
        users.push(JSON.parse(value));
      }
      count++;

      if (users.length >= pageSize) {
        break;
      }
    }

    const duration = Date.now() - startTime;
    console.log({
      level: "debug",
      event: "db_query_complete",
      operationId,
      message: "Database query completed",
      duration,
      recordsFound: count,
      recordsReturned: users.length,
    });

    return {
      total: count,
      list: users,
      currentPage: page,
    };
  } finally {
    await iterator.close();
  }
}
