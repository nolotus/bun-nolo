// src/sqliteRoutes.ts
import { API_ENDPOINTS } from "database/config";
import { getSqliteDb } from "database/sqliteDb"; // 现在这个函数接受 userId
import {
  authenticateRequest,
  authErrorResponse,
  CORS_HEADERS_AUTH,
} from "auth/utils";

// 不再需要在这里直接获取 db 实例，因为它是用户特有的
// const db = getSqliteDb(); // 移除这一行

const CORS_HEADERS = CORS_HEADERS_AUTH;

const ALLOWED_SQL_EXEC_USER_IDS = ["1c2b14b968", "0e95801d90"];

export const sqliteRoutes = {
  [API_ENDPOINTS.EXECUTE_SQL]: {
    POST: async (req: Request) => {
      const authResult = await authenticateRequest(req);

      if (authResult instanceof Response) {
        return authResult; // 认证失败，直接返回错误响应
      }

      const { userId } = authResult; // 从认证结果中获取用户ID
      console.log(`Authenticated userId for SQLite access: ${userId}`);

      if (!ALLOWED_SQL_EXEC_USER_IDS.includes(userId)) {
        return authErrorResponse(
          "此功能暂未向普通用户开放。",
          "FEATURE_NOT_AVAILABLE",
          403
        );
      }

      // --- 获取当前用户的数据库实例 ---
      const userDb = getSqliteDb(userId); // 使用用户ID获取其专属数据库实例
      // ---

      try {
        const body = await req.json().catch(() => ({}));
        const { sql_query } = body;

        if (typeof sql_query !== "string" || sql_query.trim() === "") {
          return new Response(
            JSON.stringify({ error: "Invalid or empty 'sql_query' provided." }),
            {
              status: 400,
              headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            }
          );
        }

        console.log(
          `[User: ${userId}] Received SQL for SQLite execution:`,
          sql_query
        );

        let result: any;
        const lowerCaseSql = sql_query.trim().toLowerCase();

        try {
          // 使用用户专属的数据库实例 userDb 来执行 SQL
          result = userDb.query(sql_query).all();
        } catch (e: any) {
          if (
            e.message.includes("statement does not return rows") ||
            e.message.includes("not designed to return results")
          ) {
            try {
              result = userDb.run(sql_query);
            } catch (runError: any) {
              userDb.exec(sql_query);
              result = {
                message:
                  "SQL command executed successfully (no rows returned or affected info available).",
              };
            }
          } else {
            throw e;
          }
        }

        return new Response(JSON.stringify({ success: true, result: result }), {
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      } catch (error: any) {
        console.error(
          `[User: ${userId}] Error executing SQL via SQLite API:`,
          error
        );
        return new Response(
          JSON.stringify({
            error:
              error.message ||
              "An unknown error occurred during SQLite SQL execution.",
          }),
          {
            status: 500,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
          }
        );
      }
    },
    OPTIONS: () =>
      new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      }),
  },
};
