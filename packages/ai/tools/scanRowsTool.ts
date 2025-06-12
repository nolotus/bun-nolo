import { rowKey } from "database/keys";

/* -------------------------------------------------
 * scanRowsTool
 * ------------------------------------------------*/
export const scanRowsTool = {
  name: "scanRows",
  description:
    "顺序扫描指定表的行，可用 afterRowId 做游标分页；rowId 采用 ULID 时间序",
  parameters: {
    type: "object",
    properties: {
      tenantId: { type: "string", description: "租户 ID" },
      tableId: { type: "string", description: "表 ID" },
      afterRowId: {
        type: "string",
        description: "上一次返回的最后一个 rowId（游标）",
        nullable: true,
      },
      endRowId: {
        type: "string",
        description: "扫描终止（含）rowId，可省略",
        nullable: true,
      },
      limit: { type: "integer", description: "最大返回条数", default: 100 },
    },
    required: ["tenantId", "tableId"],
  },

  /* run(params, context) —— context 注入 { db } */
  run: async (
    {
      tenantId,
      tableId,
      afterRowId,
      endRowId,
      limit = 100,
    }: {
      tenantId: string;
      tableId: string;
      afterRowId?: string | null;
      endRowId?: string | null;
      limit?: number;
    },
    { db }: { db: any }
  ) => {
    /* 1. 计算迭代范围 */
    const startKey = afterRowId
      ? rowKey.single(tenantId, tableId, afterRowId) + "\x00" // 游标后一位
      : rowKey.single(tenantId, tableId, "");

    const endKey = endRowId
      ? rowKey.single(tenantId, tableId, endRowId)
      : rowKey.single(tenantId, tableId, "\uffff");

    const it = db.iterator({
      gte: startKey,
      lte: endKey,
      keys: true,
      values: true,
    });

    /* 2. 收集行数据 */
    const rows: any[] = [];
    let lastRowId: string | null = null;

    for await (const [key, val] of it) {
      const parts = key.toString().split("-");
      lastRowId = parts.at(-1)!;
      rows.push(JSON.parse(val.toString()));

      if (rows.length >= limit) break;
    }

    return { rows, lastRowId };
  },
};
