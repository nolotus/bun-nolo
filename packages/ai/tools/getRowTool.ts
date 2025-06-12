import { rowKey } from "database/keys";

/**
 * getRowTool
 * --------------------------------------------------
 * 根据 tenantId + tableId + rowId 读取一行 JSON 数据
 */
export const getRowTool = {
  name: "getRow",
  description: "读取指定表中的单行记录",
  parameters: {
    type: "object",
    properties: {
      tenantId: { type: "string", description: "租户 ID" },
      tableId: { type: "string", description: "表 ID" },
      rowId: { type: "string", description: "行 ID（ULID 或自定义）" },
    },
    required: ["tenantId", "tableId", "rowId"],
  },

  /* run(params, context) —— context 注入 { db } */
  run: async (
    {
      tenantId,
      tableId,
      rowId,
    }: {
      tenantId: string;
      tableId: string;
      rowId: string;
    },
    { db }: { db: any }
  ) => {
    // 1. 组合主键
    const key = rowKey.single(tenantId, tableId, rowId);

    // 2. 读取数据
    const value = await db.get(key).catch(() => null);
    if (!value) {
      throw new Error(
        `getRow: record not found — tenant=${tenantId} table=${tableId} row=${rowId}`
      );
    }

    // 3. 解析 & 返回
    return JSON.parse(value.toString());
  },
};
