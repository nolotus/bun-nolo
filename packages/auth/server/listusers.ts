import { nolotusId } from "core/init";
import serverDb, { DB_PREFIX } from "database/server/db";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

export async function handleListUsers(req) {
  if (req.user.userId !== nolotusId) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: Admin access required" }),
      { status: 403, headers: CORS_HEADERS }
    );
  }

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(req.query.pageSize) || 10)
    );

    const result = await listUsers({ page, pageSize });
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: CORS_HEADERS,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}

async function listUsers({ page = 1, pageSize = 10 } = {}) {
  const prefix = DB_PREFIX.USER;
  let totalCount = 0;
  const users = [];

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
