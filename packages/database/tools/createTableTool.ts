// database/tools/createTableTool.ts
import { metaKey } from "database/keys";

export const createTableTool = {
  name: "createTable",
  description:
    "为指定租户注册一张新表：写入 meta 信息（包含表名、列定义、索引定义和创建时间）",
  run: async (
    {
      tenantId,
      tableId,
      tableName,
      columns,
      indexDefs = [],
    }: {
      tenantId: string;
      tableId: string;
      tableName: string;
      columns: Array<{ name: string; type: string }>;
      indexDefs?: Array<{ name: string; fields: string[] }>;
    },
    { db }: { db: any }
  ) => {
    const mKey = metaKey(tenantId, tableId);

    // 检查是否已存在
    try {
      await db.get(mKey);
      // 如果上面没抛 “NotFound”，说明已经存在
      throw new Error(`表 ${tableId} 已存在`);
    } catch (err: any) {
      if (!/NotFound/.test(err.message)) {
        // 不是“未找到”错误，直接抛
        throw err;
      }
    }

    // 组装 meta
    const meta = {
      name: tableName,
      columns,
      indexDefs,
      createdAt: Date.now(),
    };

    // 只需写入一条 metaKey
    await db.put(mKey, JSON.stringify(meta));

    return { tableId };
  },
};
