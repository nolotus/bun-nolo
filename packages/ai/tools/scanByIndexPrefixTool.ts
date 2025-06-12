import { idxKey, rowKey } from "database/keys";

/* -------------------------------------------------
 * 读索引段，返回 rowId 列表
 * ------------------------------------------------*/
async function collectRowIds(
  db: any,
  { start, end }: { start: string; end: string },
  limit: number
): Promise<string[]> {
  const it = db.iterator({ gte: start, lte: end, keys: true, values: false });
  const rowIds: string[] = [];

  for await (const key of it) {
    /* 索引键格式：idx-{tableId}-{tenantId}-{indexName}-{indexKey}-{rowId} */
    const parts = key.split("-");
    const rowId = parts.at(-1)!; // 最后一段就是 rowId
    rowIds.push(rowId);
    if (rowIds.length >= limit) break;
  }

  return rowIds;
}

/* -------------------------------------------------
 * 把 rowId 列表映射成完整行
 * ------------------------------------------------*/
async function fetchRows(
  db: any,
  tenantId: string,
  tableId: string,
  rowIds: string[]
) {
  const rows = [];
  for (const rowId of rowIds) {
    const raw = await db.get(rowKey.single(tenantId, tableId, rowId));
    rows.push(JSON.parse(raw.toString()));
  }
  return rows;
}

/* -------------------------------------------------
 * scanByIndexPrefixTool
 * ------------------------------------------------*/
export const scanByIndexPrefixTool = {
  name: "scanByIndexPrefix",
  description:
    "按二级索引前缀扫描行；可返回 rowId 列表或完整行数据（withData=true）",
  parameters: {
    type: "object",
    properties: {
      tenantId: { type: "string", description: "租户 ID" },
      tableId: { type: "string", description: "表 ID" },
      indexName: { type: "string", description: "索引名称" },
      indexKeyPrefix: {
        type: "string",
        description: "前缀匹配的索引键",
        default: "",
      },
      limit: { type: "integer", description: "最大返回条数", default: 100 },
      withData: {
        type: "boolean",
        description: "是否同时返回行内容",
        default: true,
      },
    },
    required: ["tenantId", "tableId", "indexName"],
  },

  /* run(params, context) —— context 注入 { db } */
  run: async (
    {
      tenantId,
      tableId,
      indexName,
      indexKeyPrefix = "",
      limit = 100,
      withData = true,
    }: {
      tenantId: string;
      tableId: string;
      indexName: string;
      indexKeyPrefix?: string;
      limit?: number;
      withData?: boolean;
    },
    { db }: { db: any }
  ) => {
    /* 1. 计算索引范围 */
    const range = idxKey.range(tenantId, tableId, indexName, indexKeyPrefix);

    /* 2. 收集 rowIds */
    const rowIds = await collectRowIds(db, range, limit);

    /* 3. 如需行内容，批量读取 */
    if (withData) {
      const rows = await fetchRows(db, tenantId, tableId, rowIds);
      return { rowIds, rows };
    }

    return { rowIds };
  },
};
