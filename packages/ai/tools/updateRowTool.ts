import { rowKey, idxKey, metaKey } from "database/keys";

/* -------------------------------------------------
 * 取表 meta
 * ------------------------------------------------*/
async function getMeta(db: any, tenantId: string, tableId: string) {
  const s = await db.get(metaKey(tenantId, tableId)).catch(() => null);
  if (!s) throw new Error(`updateRow: table ${tableId} not found`);
  return JSON.parse(s.toString());
}

/* -------------------------------------------------
 * 读取旧行
 * ------------------------------------------------*/
async function getOldRow(
  db: any,
  tenantId: string,
  tableId: string,
  rowId: string
) {
  const k = rowKey.single(tenantId, tableId, rowId);
  const v = await db.get(k).catch(() => null);
  if (!v) throw new Error(`updateRow: row not found (${rowId})`);
  return JSON.parse(v.toString());
}

/* -------------------------------------------------
 * 构造需要删除 / 插入的索引 batch
 * ------------------------------------------------*/
function diffIndexBatch(
  tenantId: string,
  tableId: string,
  rowId: string,
  meta: any,
  oldRow: Record<string, any>,
  newRow: Record<string, any>
) {
  if (!meta.indexDefs?.length) return [];

  const batch: any[] = [];

  for (const { name: idxName, fields } of meta.indexDefs) {
    const build = (r: Record<string, any>) =>
      fields.map((f: string) => r[f]).join("#");

    const oldKey = build(oldRow);
    const newKey = build(newRow);

    if (oldKey === newKey) continue; // 索引键未变

    /* 删除旧索引键（若存在非空 oldKey）*/
    if (oldKey.trim() !== "") {
      batch.push({
        type: "del",
        key: idxKey.put(tenantId, tableId, idxName, oldKey, rowId),
      });
    }

    /* 插入新索引键（若非空）*/
    if (newKey.trim() !== "") {
      batch.push({
        type: "put",
        key: idxKey.put(tenantId, tableId, idxName, newKey, rowId),
        value: "",
      });
    }
  }

  return batch;
}

/* -------------------------------------------------
 * commit 更新
 * ------------------------------------------------*/
async function commitUpdate(
  db: any,
  tenantId: string,
  tableId: string,
  rowId: string,
  newRow: Record<string, any>,
  indexBatch: any[]
) {
  const k = rowKey.single(tenantId, tableId, rowId);
  await db.batch([
    { type: "put", key: k, value: JSON.stringify(newRow) },
    ...indexBatch,
  ]);
}

/* -------------------------------------------------
 * updateRowTool
 * ------------------------------------------------*/
export const updateRowTool = {
  name: "updateRow",
  description: "更新指定行（部分字段 patch），并自动维护受影响的二级索引",
  parameters: {
    type: "object",
    properties: {
      tenantId: { type: "string", description: "租户 ID" },
      tableId: { type: "string", description: "表 ID" },
      rowId: { type: "string", description: "行 ID" },
      patchBody: { type: "object", description: "待覆盖的字段键值对" },
    },
    required: ["tenantId", "tableId", "rowId", "patchBody"],
  },

  run: async (
    {
      tenantId,
      tableId,
      rowId,
      patchBody,
    }: {
      tenantId: string;
      tableId: string;
      rowId: string;
      patchBody: Record<string, any>;
    },
    { db }: { db: any }
  ) => {
    /* 1. 表 meta + 旧行 */
    const meta = await getMeta(db, tenantId, tableId);
    const oldRow = await getOldRow(db, tenantId, tableId, rowId);

    /* 2. 合并 patch */
    const newRow = { ...oldRow, ...patchBody };

    /* 3. 生成索引差异 batch */
    const indexBatch = diffIndexBatch(
      tenantId,
      tableId,
      rowId,
      meta,
      oldRow,
      newRow
    );

    /* 4. 执行批量更新 */
    await commitUpdate(db, tenantId, tableId, rowId, newRow, indexBatch);

    /* 5. 返回新行 */
    return newRow;
  },
};
