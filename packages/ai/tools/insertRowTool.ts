import { ulid } from "ulid";
import { metaKey } from "database/keys";

/* -------------------------------------------------
 * 读取表的元数据（索引定义等）
 * ------------------------------------------------*/
async function fetchMeta(
  db: any,
  tenantId: string,
  tableId: string
): Promise<any> {
  const metaStr = await db.get(metaKey(tenantId, tableId)).catch(() => null);
  if (!metaStr) throw new Error(`Table ${tableId} not found`);
  return JSON.parse(metaStr.toString());
}

/* -------------------------------------------------
 * 生成需要写入的二级索引键数组
 * ------------------------------------------------*/
function buildIndexBatch(
  tenantId: string,
  tableId: string,
  rowId: string,
  jsonBody: Record<string, any>,
  meta: any
) {
  if (!meta?.indexDefs?.length) return [];

  const batch: Array<{ type: "put"; key: string; value: string }> = [];

  for (const { name: indexName, fields } of meta.indexDefs) {
    /* 拼 indexKey，例如 ['category','yyyymm'] => food#202406 */
    const indexKey = fields.map((f: string) => jsonBody[f]).join("#");
    if (indexKey.trim() === "") continue; // 缺字段就跳过

    batch.push({
      type: "put",
      key: idxKey.put(tenantId, tableId, indexName, indexKey, rowId),
      value: "",
    });
  }
  return batch;
}

/* -------------------------------------------------
 * 真正写入 KV 的函数
 * ------------------------------------------------*/
async function commitInsertRow(
  db: any,
  tenantId: string,
  tableId: string,
  rowId: string,
  jsonBody: Record<string, any>,
  indexBatch: any[]
) {
  const rowDbKey = rowKey.single(tenantId, tableId, rowId);

  await db.batch([
    { type: "put", key: rowDbKey, value: JSON.stringify(jsonBody) },
    ...indexBatch,
  ]);
}

/* -------------------------------------------------
 * insertRow Tool
 * ------------------------------------------------*/
export const insertRowTool = {
  name: "insertRow",
  description: "插入一行并维护二级索引",
  parameters: {
    type: "object",
    properties: {
      tenantId: { type: "string", description: "租户 ID" },
      tableId: { type: "string", description: "表 ID" },
      jsonBody: { type: "object", description: "整行 JSON 数据" },
      rowId: {
        type: "string",
        description: "可选，自定义行 ID；若省略则自动生成（ULID，推荐）",
      },
    },
    required: ["tenantId", "tableId", "jsonBody"],
  },

  /* run(params, context) —— context 注入 { db } */
  run: async (
    {
      tenantId,
      tableId,
      jsonBody,
      rowId: maybeRowId,
    }: {
      tenantId: string;
      tableId: string;
      jsonBody: Record<string, any>;
      rowId?: string;
    },
    { db }: { db: any }
  ) => {
    /* 1. 取 meta，了解需要维护哪些索引 */
    const meta = await fetchMeta(db, tenantId, tableId);

    /* 2. 确定 rowId */
    const rowId = maybeRowId || ulid();

    /* 3. 构造索引键 batch */
    const indexBatch = buildIndexBatch(
      tenantId,
      tableId,
      rowId,
      jsonBody,
      meta
    );

    /* 4. 执行批量写入 */
    await commitInsertRow(db, tenantId, tableId, rowId, jsonBody, indexBatch);

    /* 5. 返回结果 */
    return { rowId };
  },
};
