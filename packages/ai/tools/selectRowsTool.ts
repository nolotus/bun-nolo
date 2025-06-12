import { rowKey, idxKey } from "database/keys";

export const selectRowsTool = {
  name: "selectRows",
  description: "按主键/索引扫描并过滤表行，支持排序与游标分页",
  parameters: {
    type: "object",
    properties: {
      tenantId: { type: "string", description: "租户 ID" },
      tableId: { type: "string", description: "表 ID" },
      filters: {
        type: "array",
        description: "过滤条件数组",
        items: {
          type: "object",
          properties: {
            column: { type: "string" },
            op: {
              type: "string",
              enum: ["=", "!=", ">", ">=", "<", "<=", "in", "notIn"],
            },
            value: { type: ["string", "number", "array"] },
          },
          required: ["column", "op", "value"],
        },
        default: [],
      },
      indexName: {
        type: "string",
        description: "使用的二级索引名称（可选）",
      },
      afterCursor: {
        type: "string",
        description: "上次返回的游标，用于分页（可选）",
      },
      limit: {
        type: "number",
        description: "本次最多返回行数",
        default: 100,
      },
      orderBy: {
        type: "object",
        description: "排序字段及方向（可选）",
        properties: {
          column: { type: "string" },
          desc: { type: "boolean", default: false },
        },
        required: ["column"],
      },
    },
    required: ["tenantId", "tableId"],
  },

  run: async (
    {
      tenantId,
      tableId,
      filters = [],
      indexName,
      afterCursor,
      limit = 100,
      orderBy,
    }: {
      tenantId: string;
      tableId: string;
      filters?: { column: string; op: string; value: any }[];
      indexName?: string;
      afterCursor?: string;
      limit?: number;
      orderBy?: { column: string; desc?: boolean };
    },
    { db }: { db: any }
  ) => {
    // 1. 确定扫描范围
    const useIndex = Boolean(indexName);
    const scanOpts: any = { keys: true, values: false };
    if (useIndex) {
      const { start, end } = idxKey.range(tenantId, tableId, indexName!);
      scanOpts.gte = start;
      scanOpts.lte = end;
    } else {
      const { gte, lte } = rowKey.range(tenantId, tableId);
      scanOpts.gte = gte;
      scanOpts.lte = lte;
    }
    if (afterCursor) {
      scanOpts.gt = afterCursor;
      delete scanOpts.gte; // 确保从 afterCursor 之后开始
    }

    // 2. 迭代扫描，按 filters 过滤
    const rows: { rowId: string; data: any }[] = [];
    let lastCursor: string | undefined;

    for await (const key of db.iterator(scanOpts)) {
      const k = key as string;
      // 从 key 中解析 rowId
      const parts = k.split("-");
      const rowId = parts.at(-1)!;

      // 读取行数据
      const raw = await db.get(rowKey.single(tenantId, tableId, rowId));
      const data = JSON.parse(raw.toString());

      // 应用过滤条件
      let ok = true;
      for (const f of filters) {
        const v = data[f.column];
        switch (f.op) {
          case "=":
            if (v !== f.value) ok = false;
            break;
          case "!=":
            if (v === f.value) ok = false;
            break;
          case ">":
            if (!(v > f.value)) ok = false;
            break;
          case ">=":
            if (!(v >= f.value)) ok = false;
            break;
          case "<":
            if (!(v < f.value)) ok = false;
            break;
          case "<=":
            if (!(v <= f.value)) ok = false;
            break;
          case "in":
            if (!Array.isArray(f.value) || !f.value.includes(v)) ok = false;
            break;
          case "notIn":
            if (Array.isArray(f.value) && f.value.includes(v)) ok = false;
            break;
          default:
            ok = false;
        }
        if (!ok) break;
      }
      if (!ok) continue;

      rows.push({ rowId, data });
      lastCursor = k;
      if (rows.length >= limit) break;
    }

    // 3. 内存排序（当未使用索引或排序字段与索引名称不一致时）
    if (orderBy && (!useIndex || orderBy.column !== indexName)) {
      const { column, desc = false } = orderBy;
      rows.sort((a, b) => {
        const va = a.data[column];
        const vb = b.data[column];
        if (va < vb) return desc ? 1 : -1;
        if (va > vb) return desc ? -1 : 1;
        return 0;
      });
    }

    // 4. 计算下一游标
    const nextCursor = rows.length === limit ? lastCursor : undefined;
    return { rows, nextCursor };
  },
};
