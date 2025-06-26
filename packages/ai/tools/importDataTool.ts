// /ai/tools/importDataTool.ts

import type { RootState } from "app/store";
import { executeSqlFunc } from "./executeSqlTool";
import { selectPendingRawDataByPageKey } from "chat/dialog/dialogSlice";

// importDataFunctionSchema 保持不变
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

  if (!tableName || !pageKey) {
    throw new Error("`tableName` 和 `fileReferenceId` 都是必需的参数。");
  }

  try {
    const state = thunkApi.getState() as RootState;

    const pendingData = selectPendingRawDataByPageKey(state, pageKey);

    if (!pendingData || !pendingData.jsonData) {
      throw new Error(`在内存中找不到文件 (ID: ${pageKey}) 的数据。`);
    }

    const jsonData = pendingData.jsonData;
    if (!Array.isArray(jsonData) || jsonData.length === 0) {
      return { rawData: {}, displayData: "文件数据为空，未执行导入操作。" };
    }

    // [关键修复] 步骤 1: 查询数据库以获取真实的列名和大小写
    const schemaInfoResult = await executeSqlFunc(
      { sqlQuery: `PRAGMA table_info("${tableName}");` },
      thunkApi
    );

    if (
      !schemaInfoResult.rawData?.result ||
      schemaInfoResult.rawData.result.length === 0
    ) {
      throw new Error(
        `无法获取表 "${tableName}" 的结构信息，请检查表是否存在。`
      );
    }

    // 从 PRAGMA 结果中提取数据库中的真实列名
    const dbColumns = schemaInfoResult.rawData.result.map(
      (col: any) => col.name
    );

    // [关键修复] 步骤 2: 创建从“小写键名”到“原始数据键名”的映射
    // 这使得我们可以忽略大小写来匹配列
    const inputKeys = Object.keys(jsonData[0]);
    const inputKeyMap = new Map(
      inputKeys.map((key) => [key.toLowerCase(), key])
    );

    // [关键修复] 步骤 3: 准备基于真实数据库列名的 INSERT 语句
    const columnNamesForSql = dbColumns.map((col) => `"${col}"`).join(", ");
    const valuePlaceholders = `(${dbColumns.map(() => "?").join(", ")})`;
    const insertQueryTemplate = `INSERT INTO "${tableName}" (${columnNamesForSql}) VALUES ${valuePlaceholders};`;

    let totalAffectedRows = 0;

    await executeSqlFunc({ sqlQuery: "BEGIN TRANSACTION;" }, thunkApi);
    try {
      for (const row of jsonData) {
        // [关键修复] 步骤 4: 按数据库列的顺序，不区分大小写地从数据行中提取值
        const params = dbColumns.map((dbCol) => {
          const originalInputKey = inputKeyMap.get(dbCol.toLowerCase());
          // 如果在输入数据中找到了匹配的列（忽略大小写），则使用其值
          if (originalInputKey) {
            return row[originalInputKey] ?? null;
          }
          // 如果数据库有这个列，但输入数据没有，则插入 NULL
          return null;
        });

        const result = await executeSqlFunc(
          { sqlQuery: insertQueryTemplate, params },
          thunkApi
        );
        totalAffectedRows += result.rawData?.result?.changes ?? 0;
      }
      await executeSqlFunc({ sqlQuery: "COMMIT;" }, thunkApi);
    } catch (innerError) {
      await executeSqlFunc({ sqlQuery: "ROLLBACK;" }, thunkApi);
      throw innerError;
    }

    const displayData = `成功将文件中的 ${jsonData.length} 条记录导入到表 "${tableName}"。总共影响行数: ${totalAffectedRows}。`;

    return {
      rawData: {
        importedCount: jsonData.length,
        affectedRows: totalAffectedRows,
      },
      displayData,
    };
  } catch (error: any) {
    console.error("Import Data tool error:", error);
    throw new Error(`数据导入失败: ${error.message}`);
  }
}
