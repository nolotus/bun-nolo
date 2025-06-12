// ./deleteRowTool.ts
import { rowKey, idxKey, metaKey } from "database/keys";

/* -------------------------------------------------
 * fetch helpers
 * ------------------------------------------------*/
async function getMeta(db: any, tenantId: string, tableId: string) {
  const s = await db.get(metaKey(tenantId, tableId)).catch(() => null);
  if (!s) throw new Error(`deleteRow: meta not found (${tableId})`);
  return JSON.parse(s.toString());
}

async function getRow(
  db: any,
  tenantId: string,
  tableId: string,
  rowId: string
) {
  const k = rowKey.single(tenantId, tableId, rowId);
  const v = await db.get(k).catch(() => null);
  if (!v) throw new Error(`deleteRow: row not found (${rowId})`);
  return JSON.parse(v.toString());
}

/* -------------------------------------------------
 * build index delete batch
 * ------------------------------------------------*/
function buildIndexDelBatch(
  tenantId: string,
  tableId: string,
  rowId: string,
  meta: any,
  row: Record<string, any>
) {
  if (!meta.indexDefs?.length) return [];

  const batch: any[] = [];

  for (const { name: idxName, fields } of meta.indexDefs) {
    const idxKeyStr = fields.map((f: string) => row[f]).join("#");
    if (idxKeyStr.trim() === "") continue; // 该行未写此索引

    batch.push({
      type: "del",
      key: idxKey.put(tenantId, tableId, idxName, idxKeyStr, rowId),
    });
  }

  return batch;
}

/* -------------------------------------------------
 * commit delete
 * ------------------------------------------------*/
async function commitDelete(
  db: any,
  tenantId: string,
  tableId: string,
  rowId: string,
  indexBatch: any[]
) {
  const k = rowKey.single(tenantId, tableId, rowId);
  await db.batch([{ type: "del", key: k }, ...indexBatch]);
}

/* -------------------------------------------------
 * deleteRowTool
 * ------------------------------------------------*/
export const deleteRowTool = {
  name: "deleteRow",
  description: "删除单行并清理相关二级索引",
  parameters: {
    type: "object",
    properties: {
      tenantId: { type: "string", description: "租户 ID" },
      tableId: { type: "string", description: "表 ID" },
      rowId: { type: "string", description: "行 ID" },
    },
    required: ["tenantId", "tableId", "rowId"],
  },

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
    const meta = await getMeta(db, tenantId, tableId);
    const row = await getRow(db, tenantId, tableId, rowId);

    const indexBatch = buildIndexDelBatch(tenantId, tableId, rowId, meta, row);

    await commitDelete(db, tenantId, tableId, rowId, indexBatch);

    return { deleted: true };
  },
};
