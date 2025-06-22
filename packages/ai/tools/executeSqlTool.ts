// /ai/tools/executeSqlTool.ts (已更新至新架构)

import type { RootState } from "app/store";
import { selectCurrentServer } from "setting/settingSlice";
import { API_ENDPOINTS } from "database/config";
import { selectCurrentToken } from "auth/authSlice";

/**
 * [Schema] 定义了 'executeSql' 工具的结构，供 LLM 调用。
 */
export const executeSqlFunctionSchema = {
  // 已从 'execute_sql' 更新为 'executeSql'
  name: "executeSql",
  description:
    "直接在 SQLite 数据库中执行任意 SQL 语句，包括查询、插入、更新、删除和表结构操作。",
  parameters: {
    type: "object",
    properties: {
      // 已从 'sql_query' 更新为 'sqlQuery'
      sqlQuery: {
        type: "string",
        description:
          "要执行的完整 SQL 语句。例如：SELECT * FROM users; INSERT INTO products (name) VALUES ('Milk'); CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY, message TEXT);",
      },
    },
    required: ["sqlQuery"],
  },
};

// --- 内部辅助函数 (保持不变，封装良好) ---

const getRequestConfig = (
  thunkApi: any
): { currentServer: string; token: string | null } => {
  const state = thunkApi.getState() as RootState;
  const currentServer = selectCurrentServer(state);
  const token = selectCurrentToken(state);
  if (!currentServer) throw new Error("无法获取当前服务器地址。");
  return { currentServer, token };
};

const buildApiUrl = (serverBaseUrl: string, endpoint: string): string => {
  return `${serverBaseUrl}${endpoint}`;
};

const buildRequestHeaders = (token: string | null): HeadersInit => {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

const postRequest = async (
  url: string,
  headers: HeadersInit,
  body: object
): Promise<Response> => {
  return fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
};

const handleApiResponse = async (response: Response): Promise<any> => {
  if (!response.ok) {
    let errorMessage = `API 错误！状态码: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData?.error) {
        errorMessage += `: ${errorData.error.message || JSON.stringify(errorData.error)}`;
      }
    } catch (e) {
      /* 忽略json解析错误 */
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

const formatSqlResultText = (data: any, sqlQuery: string): string => {
  if (!data.success) return `SQL 执行失败：${data.error || "未知错误"}`;

  const result = data.result;
  const lowerCaseQuery = sqlQuery.trim().toLowerCase();
  let resultText = "";

  if (Array.isArray(result)) {
    if (
      lowerCaseQuery.startsWith("pragma table_info(") &&
      result.length > 0 &&
      result[0].cid !== undefined &&
      result[0].name !== undefined &&
      result[0].type !== undefined
    ) {
      resultText = `表结构信息 (${result.length} 列):\n\n\`\`\`\n| 列名        | 类型      | 非空 | 主键 |\n|-------------|-----------|------|------|\n`;
      result.forEach((col: any) => {
        resultText += `| ${String(col.name).padEnd(11)} | ${String(col.type).padEnd(9)} | ${(col.notnull ? "是" : "否").padEnd(4)} | ${(col.pk ? "是" : "否").padEnd(4)} |\n`;
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
        if (result.length > 5)
          resultText += `\n... 更多 ${result.length - 5} 条记录未显示。`;
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
      if (result.lastInsertRowid)
        resultText += ` 最后插入ID：${result.lastInsertRowid}。`;
    } else {
      resultText = `SQL 命令执行成功，原始响应：${JSON.stringify(result)}`;
    }
  } else {
    resultText = `SQL 命令执行成功，原始响应：${JSON.stringify(result)}`;
  }
  return resultText;
};

/**
 * [Executor] 'executeSql' 工具的执行函数。
 * @param args - LLM 提供的参数: { sqlQuery: string }
 * @param thunkApi - Redux Thunk API
 * @returns {Promise<{rawData: any, displayData: string}>} - 返回标准化的结果对象
 */
export async function executeSqlFunc(
  args: { sqlQuery: string },
  thunkApi: any
): Promise<{ rawData: any; displayData: string }> {
  const { sqlQuery } = args;

  if (!sqlQuery || typeof sqlQuery !== "string" || sqlQuery.trim() === "") {
    throw new Error("SQL 执行失败：'sqlQuery' 必须为非空字符串。");
  }

  try {
    const { currentServer, token } = getRequestConfig(thunkApi);
    const apiUrl = buildApiUrl(currentServer, API_ENDPOINTS.EXECUTE_SQL);
    const requestHeaders = buildRequestHeaders(token);

    const response = await postRequest(apiUrl, requestHeaders, {
      // 注意：发送给后端的字段名仍然是 'sql_query'，与后端API保持一致
      sql_query: sqlQuery,
    });

    const responseData = await handleApiResponse(response);

    // 生成用于UI展示的文本和用于后续步骤的原始数据
    const displayData = formatSqlResultText(responseData, sqlQuery);
    const rawData = responseData; // 完整的后端响应作为原始数据

    return { rawData, displayData };
  } catch (error: any) {
    console.error("Execute SQL tool error:", error);
    // 重新抛出格式化的错误，以便上层捕获并显示
    throw new Error(`SQL 执行失败：${error.message}`);
  }
}
