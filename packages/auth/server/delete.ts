import serverDb, { DB_PREFIX } from "database/server/db";
import pino from "pino";

const logger = pino();
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

/**
 * 从URL路径中提取userId
 */
function extractUserIdFromPath(url) {
  const matches = url.pathname.match(/\/users\/([^\/]+)$/);
  return matches ? matches[1] : null;
}

/**
 * 处理删除用户请求
 */
export async function handleDeleteUser(req) {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const requestId = Math.random().toString(36).slice(7);
  logger.info({ requestId, url: req.url }, "Processing delete user request");

  try {
    const userId = extractUserIdFromPath(req.url);

    if (!userId) {
      throw new Error("User ID is required");
    }

    await deleteUser(userId);

    logger.info({ requestId, userId }, "User deleted successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (error) {
    logger.error(
      {
        requestId,
        error: error.message,
      },
      "Failed to delete user"
    );

    const status =
      error.message === "User ID is required"
        ? 400
        : error.message === "User not found"
          ? 404
          : 500;

    return new Response(
      JSON.stringify({
        error: "Failed to delete user",
        message: error.message,
      }),
      {
        status,
        headers: CORS_HEADERS,
      }
    );
  }
}

/**
 * 删除用户及其相关数据
 */
async function deleteUser(userId) {
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
    logger.error(
      {
        userId,
        error: error.message,
      },
      "Database delete failed"
    );
    throw error;
  }
}
