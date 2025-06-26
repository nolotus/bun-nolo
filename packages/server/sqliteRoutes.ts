// src/sqliteRoutes.ts

import { API_ENDPOINTS } from "database/config";
import { getSqliteDb } from "database/sqliteDb";
import {
  authenticateRequest,
  authErrorResponse,
  CORS_HEADERS_AUTH,
} from "auth/utils";

const CORS_HEADERS = CORS_HEADERS_AUTH;

const ALLOWED_SQL_EXEC_USER_IDS = ["1c2b14b968", "0e95801d90", "21b40f2e04"];

export const sqliteRoutes = {
  [API_ENDPOINTS.EXECUTE_SQL]: {
    POST: async (req: Request) => {
      const authResult = await authenticateRequest(req);

      if (authResult instanceof Response) {
        return authResult;
      }

      const { userId } = authResult;
      console.log(`Authenticated userId for SQLite access: ${userId}`);

      if (!ALLOWED_SQL_EXEC_USER_IDS.includes(userId)) {
        return authErrorResponse(
          "此功能暂未向普通用户开放。",
          "FEATURE_NOT_AVAILABLE",
          403
        );
      }

      const userDb = getSqliteDb(userId);

      try {
        const body = await req.json().catch(() => ({}));

        // [关键修复] 1. 同时解构 sql_query 和可选的 params
        const { sql_query, params } = body as {
          sql_query: string;
          params?: any[];
        };

        if (typeof sql_query !== "string" || sql_query.trim() === "") {
          return new Response(
            JSON.stringify({ error: "Invalid or empty 'sql_query' provided." }),
            {
              status: 400,
              headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            }
          );
        }

        // [关键修复] 2. 增加对 params 类型的校验
        if (params && !Array.isArray(params)) {
          return new Response(
            JSON.stringify({ error: "'params' must be an array." }),
            {
              status: 400,
              headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
            }
          );
        }

        // [增强] 改进日志记录，方便调试
        console.log(`[User: ${userId}] Received SQL:`, sql_query);
        if (params) {
          console.log(`[User: ${userId}] With Params:`, JSON.stringify(params));
        }

        let result: any;

        // [关键修复] 3. 使用支持参数绑定的方法执行 SQL
        try {
          // .query(sql) 返回一个 Statement 对象
          // .all(...params) 在该 Statement 上执行并绑定参数
          // bun:sqlite 的这个设计可以完美处理有无参数的情况
          const statement = userDb.query(sql_query);
          result = statement.all(...(params || []));
        } catch (e: any) {
          // 如果查询不是为了返回行（例如 INSERT, UPDATE, DELETE），.all() 会报错
          if (
            e.message.includes("statement does not return rows") ||
            e.message.includes("not designed to return results")
          ) {
            try {
              // .run(sql, ...params) 用于执行不返回行的语句，并支持参数绑定
              result = userDb.run(sql_query, ...(params || []));
            } catch (runError: any) {
              // 最后的 fallback，只对无参数的、可能包含多语句的 SQL 生效
              if (params && params.length > 0) {
                // 如果带有参数的 .run() 都失败了，这是一个真实错误，应该抛出
                throw runError;
              }
              userDb.exec(sql_query);
              result = { message: "SQL command executed successfully." };
            }
          } else {
            // 重新抛出其他类型的查询错误
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
            error: error.message || "An unknown error occurred.",
          }),
          {
            status: 500,
            headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
          }
        );
      }
    },
    OPTIONS: () => new Response(null, { status: 204, headers: CORS_HEADERS }),
  },
};
