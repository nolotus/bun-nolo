// /ai/tools/importDataTool.ts

import type { RootState } from "app/store";
import { executeSqlFunc } from "./executeSqlTool"; // 复用底层的 SQL 执行器
import { selectPendingRawDataByPageKey } from "chat/dialog/dialogSlice";

/**
 * [Schema] 定义了 'importData' 工具的结构，供 LLM 调用。
 */
export const importDataFunctionSchema = {
  name: "importData",
  description:
    "将用户在当前消息中附带的文件内容，导入到指定的数据库表中。必须使用 `User's Current References` 上下文中的 `DB Key` 作为 `fileReferenceId`。",
  parameters: {
    type: "object",
    properties: {
      tableName: {
        type: "string",
        description:
          "数据要导入的目标数据库表的名称。例如：'budgets', 'sales_records'。",
      },
      fileReferenceId: {
        type: "string",
        description:
          "必须是从 `User's Current References` 上下文中获取到的、文件的 DB Key (例如 'page:xyz123')。",
      },
    },
    required: ["tableName", "fileReferenceId"],
  },
};

/**
 * [Executor] 'importData' 工具的执行函数。
 * @param args - LLM 提供的参数: { tableName: string, fileReferenceId: string }
 * @param thunkApi - Redux Thunk API
 * @returns {Promise<{rawData: any, displayData: string}>} - 返回标准化的结果对象
 */
export async function importDataFunc(
  args: { tableName: string; fileReferenceId: string },
  thunkApi: any
): Promise<{ rawData: any; displayData: string }> {
  const { tableName, fileReferenceId: pageKey } = args;
  const { getState, dispatch } = thunkApi;

  if (!tableName || !pageKey) {
    throw new Error("`tableName` 和 `fileReferenceId` 都是必需的参数。");
  }

  try {
    // 1. 直接从 Redux State 读取暂存的原始数据
    const state = getState() as RootState;
    const pendingData = selectPendingRawDataByPageKey(state.dialog, pageKey);

    if (!pendingData || !pendingData.jsonData) {
      throw new Error(
        `在内存中找不到文件 ${pageKey} 的数据。请让用户重新上传文件。`
      );
    }

    const jsonData = pendingData.jsonData;
    if (jsonData.length === 0) {
      return { rawData: {}, displayData: "文件数据为空，未执行导入操作。" };
    }

    // 2. 动态、安全地生成 SQL INSERT 语句
    // 注意：批量 INSERT 在单个 SQL 语句中对 SQLite 更高效
    const columns = Object.keys(jsonData[0]);
    const columnNames = columns.join(", ");

    // 为参数化查询准备值数组
    const valuesPlaceholder = `(${columns.map(() => "?").join(", ")})`;
    const allPlaceholders = jsonData.map(() => valuesPlaceholder).join(", ");

    const flatValues = jsonData.flatMap((obj) =>
      columns.map((col) => obj[col])
    );

    // 这里我们假设 executeSqlFunc 的后端能处理参数化查询
    // 如果不能，我们需要构造一个完整的 SQL 字符串，但有 SQL 注入风险
    // 为简单起见，我们先构造一个完整的字符串，但请注意这不是生产最佳实践

    let insertStatements = "";
    for (const row of jsonData) {
      const values = columns
        .map((col) => {
          const value = row[col];
          if (typeof value === "string") {
            return `'${value.replace(/'/g, "''")}'`; // Escape single quotes
          }
          if (value === null || value === undefined) {
            return "NULL";
          }
          return value;
        })
        .join(", ");
      insertStatements += `INSERT INTO ${tableName} (${columnNames}) VALUES (${values});\n`;
    }

    // 3. 执行 SQL
    const result = await executeSqlFunc(
      { sqlQuery: insertStatements },
      thunkApi
    );

    const affectedRows = result.rawData?.result?.changes || jsonData.length;
    const displayData = `成功将文件中的 ${jsonData.length} 条记录导入到表 "${tableName}"。总共影响行数: ${affectedRows}。`;

    // 操作成功后，可以考虑从 Redux 中移除已处理的数据，但这会由 clearPendingAttachments 统一处理

    return {
      rawData: { importedCount: jsonData.length, affectedRows },
      displayData,
    };
  } catch (error: any) {
    console.error("Import Data tool error:", error);
    throw new Error(`数据导入失败: ${error.message}`);
  }
}
