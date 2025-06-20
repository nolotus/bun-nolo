// 文件路径: ai/tools/executeSqlTool.ts

import { selectCurrentServer } from "setting/settingSlice";
import { API_ENDPOINTS } from "database/config";
import { selectCurrentToken } from "auth/authSlice";

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

// --- 新增的辅助函数 ---

/**
 * 从 Redux state 中获取请求所需的配置信息。
 * @param {any} thunkApi - Redux thunk API 对象。
 * @returns {{currentServer: string, token: string | null}} 配置对象
 * @throws {Error} 如果当前服务器地址未设置。
 */
const getRequestConfig = (
  thunkApi: any
): { currentServer: string; token: string | null } => {
  const state = thunkApi.getState();
  const currentServer = selectCurrentServer(state);
  const token = selectCurrentToken(state);

  if (!currentServer) {
    throw new Error("无法获取当前服务器地址。");
  }
  return { currentServer, token };
};

/**
 * 构建 API 的完整 URL。
 * @param {string} serverBaseUrl - 服务器基础 URL。
 * @param {string} endpoint - API 端点路径。
 * @returns {string} 完整的 API URL。
 */
const buildApiUrl = (serverBaseUrl: string, endpoint: string): string => {
  return `${serverBaseUrl}${endpoint}`;
};

/**
 * 构建请求头部。
 * @param {string | null} token - 认证 Token。
 * @returns {HeadersInit} 请求头部对象。
 */
const buildRequestHeaders = (token: string | null): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

/**
 * 发送 HTTP POST 请求。
 * @param {string} url - 请求的 URL。
 * @param {HeadersInit} headers - 请求头部。
 * @param {object} body - 请求体。
 * @returns {Promise<Response>} Fetch API 的 Response 对象。
 */
const postRequest = async (
  url: string,
  headers: HeadersInit,
  body: object
): Promise<Response> => {
  return fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body),
  });
};

/**
 * 处理 HTTP 响应。
 * @param {Response} response - Fetch API 的 Response 对象。
 * @returns {Promise<any>} 解析后的 JSON 数据。
 * @throws {Error} 如果响应不成功或解析失败。
 */
const handleApiResponse = async (response: Response): Promise<any> => {
  if (!response.ok) {
    let errorMessage = `API 错误！状态码: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.error) {
        errorMessage += `: ${errorData.error.message || JSON.stringify(errorData.error)}`;
      }
    } catch (jsonError) {
      // 如果响应不是 JSON，则忽略此错误，使用原始状态码错误信息
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

/**
 * 格式化 SQL 执行结果。
 * (此函数逻辑与原代码中的结果格式化部分相同)
 * @param {any} data - 从后端获取的原始数据。
 * @param {string} sqlQuery - 执行的 SQL 查询语句。
 * @returns {{ success: boolean; name: string; id: string; text: string; fullResponse: any }} 格式化后的结果对象。
 */
const formatSqlResult = (
  data: any,
  sqlQuery: string
): {
  success: boolean;
  name: string;
  id: string;
  text: string;
  fullResponse: any;
} => {
  let resultText = "";
  if (data.success) {
    const result = data.result;
    const lowerCaseQuery = sqlQuery.trim().toLowerCase();

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
        result.forEach((col: any) => {
          const colName = String(col.name).padEnd(11);
          const colType = String(col.type).padEnd(9);
          const notNull = col.notnull ? "是" : "否"; // 注意：SQLite中 notnull=1 表示非空，0表示可空。这里做了调整以符合直觉。
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
            "```json\n" + JSON.stringify(result.slice(0, 5), null, 2) + "\n```";
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
        if (result.lastInsertRowid !== undefined && result.lastInsertRowid > 0)
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
};

// --- 重构后的 executeSql 函数 ---

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
  currentUserId?: string // currentUserId 暂未在请求逻辑中使用，保留以备将来使用
) => {
  // 1. 参数验证
  if (
    !args.sql_query ||
    typeof args.sql_query !== "string" ||
    args.sql_query.trim() === ""
  ) {
    // 这里可以直接返回一个符合工具期望的错误对象结构，或者抛出错误由上层捕获
    // 为了与原逻辑一致，这里抛出错误
    throw new Error("SQL 执行失败：'sql_query' 必须为非空字符串。");
  }

  try {
    // 2. 获取请求配置
    const { currentServer, token } = getRequestConfig(thunkApi);

    // 3. 构建 API URL
    const apiUrl = buildApiUrl(currentServer, API_ENDPOINTS.EXECUTE_SQL);

    // 4. 构建请求头部
    const requestHeaders = buildRequestHeaders(token);

    // 5. 发送 POST 请求到后端
    const response = await postRequest(apiUrl, requestHeaders, {
      sql_query: args.sql_query,
    });

    // 6. 处理后端响应
    const responseData = await handleApiResponse(response);

    // 7. 格式化结果以供 AI 和用户使用
    return formatSqlResult(responseData, args.sql_query);
  } catch (error: any) {
    console.error("Execute SQL tool error:", error);
    // 重新抛出错误，或构造成特定格式的错误对象返回
    // 例如: return { success: false, name: "SQL 命令执行", id: "sql-execution-error", text: `SQL 执行失败：${error.message}`, fullResponse: null };
    // 为了与原逻辑一致，这里抛出错误
    throw new Error(`SQL 执行失败：${error.message}`);
  }
};
