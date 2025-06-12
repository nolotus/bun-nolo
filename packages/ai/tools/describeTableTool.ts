import { metaKey, rowKey, idxKey } from "database/keys";

async function countRange(db: any, gte: string, lte: string): Promise<number> {
  let cnt = 0;
  const it = db.iterator({ gte, lte, keys: true, values: false });
  for await (const _ of it) {
    cnt++;
  }
  return cnt;
}

export const describeTableTool = {
  name: "describeTable",
  description:
    "读取指定表的 meta（表名、列定义、索引定义、创建时间）；可选返回行数和索引大小统计",
  parameters: {
    type: "object",
    properties: {
      tenantId: { type: "string", description: "租户 ID" },
      tableId: { type: "string", description: "表 ID" },
      withStats: {
        type: "boolean",
        description: "是否返回统计信息（rowCount, indexSize）",
        default: false,
      },
    },
    required: ["tenantId", "tableId"],
  },

  run: async (
    {
      tenantId,
      tableId,
      withStats = false,
    }: {
      tenantId: string;
      tableId: string;
      withStats?: boolean;
    },
    { db }: { db: any }
  ) => {
    // 1. 读取 meta
    let raw: Buffer;
    try {
      raw = await db.get(metaKey(tenantId, tableId));
    } catch {
      throw new Error(`表 ${tableId} 未注册（meta 不存在）`);
    }
    const meta = JSON.parse(raw.toString()) as {
      name: string;
      columns: Array<{ name: string; type: string }>;
      indexDefs: Array<{ name: string; fields: string[] }>;
      createdAt: number;
    };

    // 2. 转换列定义到 map
    const columns: Record<string, string> = {};
    for (const col of meta.columns) {
      columns[col.name] = col.type;
    }

    // 3. 提取索引列表
    const indexes = meta.indexDefs.map((idx) => idx.name);

    // 4. 组装基础返回
    const result: {
      name: string;
      createdAt: number;
      columns: Record<string, string>;
      indexDefs: Array<{ name: string; fields: string[] }>;
      indexes: string[];
      stats?: { rowCount: number; indexSize: number };
    } = {
      name: meta.name,
      createdAt: meta.createdAt,
      columns,
      indexDefs: meta.indexDefs,
      indexes,
    };

    // 5. 如果需要统计，分别扫描行键和索引键范围
    if (withStats) {
      const { gte: rgte, lte: rlte } = rowKey.range(tenantId, tableId);
      const rowCount = await countRange(db, rgte, rlte);
      const { gte: igte, lte: ilte } = idxKey.prefix(tenantId, tableId);
      const indexSize = await countRange(db, igte, ilte);
      result.stats = { rowCount, indexSize };
    }

    return result;
  },
};
