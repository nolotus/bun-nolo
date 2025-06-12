// database/tools/listTablesTool.ts
import { metaKey } from "database/keys";

export const listTablesTool = {
  name: "listTables",
  description: "列出租户下所有表的 tableId",
  run: async (
    { tenantId }: { tenantId: string },
    { db }: { db: any }
  ): Promise<string[]> => {
    const gte = metaKey(tenantId, "");
    const lte = metaKey(tenantId, "\uffff");
    const tableIds: string[] = [];

    // LevelDB iterator（或 createReadStream）只读 key，不取 value
    for await (const { key } of db.iterator({
      gte,
      lte,
      keys: true,
      values: false,
    })) {
      // key 格式： "meta-{tenantId}-{tableId}"
      const parts = key.split("-");
      tableIds.push(parts[2]);
    }

    return tableIds;
  },
};
