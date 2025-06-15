// 文件路径: ai/tools/executeSqlTool.ts

import { selectCurrentServer } from "setting/settingSlice";
import { API_ENDPOINTS } from "database/config";
import { selectCurrentToken } from "auth/authSlice"; // **新增导入：用于获取当前用户的token**

/**
 * 供 AI 模型使用的工具定义。
 * 告诉 AI 这个工具叫什么，能做什么，需要什么参数。
 */
export const executeSqlTool = {
  type: "function",
  function: {
    name: "execute_sql",
    description:
      "直接在 SQLite 数据库中执行任意 SQL 语句，包括查询、插入、更新、删除和表结构操作。",
    parameters: {
      type: "object",
      properties: {
        sql_query: {
          type: "string",
          description:
            "要执行的完整 SQL 语句。例如：SELECT * FROM users; INSERT INTO products (name) VALUES ('Milk'); CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY, message TEXT);",
        },
      },
      required: ["sql_query"],
    },
  },
};

/**
 * 实际执行 SQL 操作的函数。
 * 这个函数会被 AI 代理层（例如您正在使用的 thunk 或类似的机制）调用。
 *
 * @param {object} args - 从 AI 工具调用中提取的参数。
 * @param {string} args.sql_query - 要执行的 SQL 语句字符串。
 * @param {any} thunkApi - 类似于 Redux Toolkit thunk 的 API 对象，用于获取 state 等。
 * @param {string} currentUserId - 可选的用户ID，用于权限或其他日志记录。
 * @returns {Promise<object>} - 返回包含操作结果的 Promise。
 */
export const executeSql = async (
  args: { sql_query: string },
  thunkApi: any,
  currentUserId?: string
) => {
  // 1. 参数验证
  if (
    !args.sql_query ||
    typeof args.sql_query !== "string" ||
    args.sql_query.trim() === ""
  ) {
    throw new Error("SQL 执行失败：'sql_query' 必须为非空字符串。");
  }

  try {
    // 2. 获取当前服务器地址和认证token
    const state = thunkApi.getState();
    const currentServer = selectCurrentServer(state);
    const token = selectCurrentToken(state); // **获取认证token**

    if (!currentServer) {
      throw new Error("SQL 执行失败：无法获取当前服务器地址。");
    }

    // 3. 构建后端 API URL
    const apiUrl = `${currentServer}${API_ENDPOINTS.EXECUTE_SQL}`;

    // 4. 发送 POST 请求到后端
    const requestHeaders: HeadersInit = {
      "Content-Type": "application/json",
    };

    // **如果存在 token，则添加到 Authorization 头中**
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: requestHeaders, // **使用包含 Authorization 的头部**
      body: JSON.stringify({ sql_query: args.sql_query }),
    });

    // 5. 处理后端响应
    if (!response.ok) {
      let errorMessage = `API 错误！状态码: ${response.status}`;
      // 尝试解析后端返回的错误信息（特别是403 Forbidden的提示）
      try {
        const errorData = await response.json();
        if (errorData && errorData.error) {
          errorMessage += `: ${errorData.error.message || JSON.stringify(errorData.error)}`;
        }
      } catch (jsonError) {
        // 如果响应不是 JSON，则忽略此错误
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // 6. 格式化结果以供 AI 和用户使用 (此部分保持不变)
    let resultText = "";
    if (data.success) {
      const result = data.result;
      const lowerCaseQuery = args.sql_query.trim().toLowerCase();

      if (Array.isArray(result)) {
        if (
          lowerCaseQuery.startsWith("pragma table_info(") &&
          result.length > 0 &&
          result[0].cid !== undefined &&
          result[0].name !== undefined &&
          result[0].type !== undefined
        ) {
          resultText = `表结构信息 (${result.length} 列):\n\n`;
          resultText += "```\n";
          resultText += "| 列名        | 类型      | 非空 | 主键 |\n";
          resultText += "|-------------|-----------|------|------|\n";
          result.forEach((col) => {
            const colName = String(col.name).padEnd(11);
            const colType = String(col.type).padEnd(9);
            const notNull = col.notnull ? "否" : "是";
            const pk = col.pk ? "是" : "否";
            resultText += `| ${colName} | ${colType} | ${notNull.padEnd(4)} | ${pk.padEnd(4)} |\n`;
          });
          resultText += "```";
        } else if (
          lowerCaseQuery.includes("sqlite_master") &&
          lowerCaseQuery.includes("select sql") &&
          result.length > 0 &&
          result[0].sql !== undefined
        ) {
          resultText = `表创建 SQL 语句:\n\n\`\`\`sql\n${result[0].sql}\n\`\`\``;
        } else {
          resultText = `SQL 查询成功，返回 ${result.length} 条记录。\n\n`;
          if (result.length > 0) {
            resultText +=
              "```json\n" +
              JSON.stringify(result.slice(0, 5), null, 2) +
              "\n```";
            if (result.length > 5) {
              resultText += `\n... 更多 ${result.length - 5} 条记录未显示。`;
            }
          } else {
            resultText += "没有找到匹配的记录。";
          }
        }
      } else if (typeof result === "object" && result !== null) {
        if (result.message) {
          resultText = `SQL 命令执行成功：${result.message}`;
        } else if (
          result.changes !== undefined ||
          result.lastInsertRowid !== undefined
        ) {
          resultText = `SQL 命令执行成功。`;
          if (result.changes !== undefined)
            resultText += ` 影响行数：${result.changes}。`;
          if (
            result.lastInsertRowid !== undefined &&
            result.lastInsertRowid > 0
          )
            resultText += ` 最后插入ID：${result.lastInsertRowid}。`;
        } else {
          resultText = `SQL 命令执行成功，但没有特定结果信息。原始响应：${JSON.stringify(result)}`;
        }
      } else {
        resultText = `SQL 命令执行成功，原始响应：${JSON.stringify(result)}`;
      }
    } else {
      resultText = `SQL 执行失败：${data.error || "未知错误"}`;
    }

    return {
      success: data.success,
      name: "SQL 命令执行",
      id: "sql-execution",
      text: resultText,
      fullResponse: data,
    };
  } catch (error: any) {
    console.error("Execute SQL tool error:", error);
    throw new Error(`SQL 执行失败：${error.message}`);
  }
};
