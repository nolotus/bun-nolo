import { rowKey } from "database/keys";

type FilterExpr = {
  column: string;
  op: "=" | "!=" | ">" | ">=" | "<" | "<=" | "in" | "notIn";
  value: any;
};

function matchFilter(data: any, f: FilterExpr): boolean {
  const v = data[f.column];
  switch (f.op) {
    case "=":
      return v === f.value;
    case "!=":
      return v !== f.value;
    case ">":
      return v > f.value;
    case ">=":
      return v >= f.value;
    case "<":
      return v < f.value;
    case "<=":
      return v <= f.value;
    case "in":
      return Array.isArray(f.value) && f.value.includes(v);
    case "notIn":
      return Array.isArray(f.value) && !f.value.includes(v);
    default:
      return false;
  }
}

function matchFilters(data: any, filters?: FilterExpr[]): boolean {
  if (!filters || filters.length === 0) return true;
  return filters.every((f) => matchFilter(data, f));
}

export const joinTablesTool = {
  name: "joinTables",
  description:
    "对两张表做等值内联 JOIN，返回扁平合并后的行，字段冲突时用前缀区分",
  parameters: {
    type: "object",
    properties: {
      tenantId: { type: "string", description: "租户 ID" },
      leftTableId: { type: "string", description: "左表 ID" },
      rightTableId: { type: "string", description: "右表 ID" },
      leftKey: { type: "string", description: "左表用于 JOIN 的字段名" },
      rightKey: { type: "string", description: "右表用于 JOIN 的字段名" },
      whereLeft: {
        type: "array",
        description: "左表过滤条件",
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
      whereRight: {
        type: "array",
        description: "右表过滤条件",
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
      limit: {
        type: "number",
        description: "最大返回行数",
        default: 500,
      },
    },
    required: [
      "tenantId",
      "leftTableId",
      "rightTableId",
      "leftKey",
      "rightKey",
    ],
  },

  run: async (
    {
      tenantId,
      leftTableId,
      rightTableId,
      leftKey,
      rightKey,
      whereLeft = [],
      whereRight = [],
      limit = 500,
    }: {
      tenantId: string;
      leftTableId: string;
      rightTableId: string;
      leftKey: string;
      rightKey: string;
      whereLeft?: FilterExpr[];
      whereRight?: FilterExpr[];
      limit?: number;
    },
    { db }: { db: any }
  ) => {
    // 1. 扫描右表，过滤并按 join 键分组
    const rightMap = new Map<any, Array<{ rowId: string; data: any }>>();
    {
      const { gte, lte } = rowKey.range(tenantId, rightTableId);
      const it = db.iterator({ gte, lte, keys: true, values: false });
      for await (const k of it) {
        const key = k as string;
        const parts = key.split("-");
        const rowId = parts.at(-1)!;
        const raw = await db.get(key);
        const data = JSON.parse(raw.toString());
        if (!matchFilters(data, whereRight)) continue;
        const joinVal = data[rightKey];
        if (joinVal === undefined) continue;
        const bucket = rightMap.get(joinVal) || [];
        bucket.push({ rowId, data });
        rightMap.set(joinVal, bucket);
      }
    }

    // 2. 扫描左表，过滤并与右表分组做内联
    const results: any[] = [];
    {
      const { gte, lte } = rowKey.range(tenantId, leftTableId);
      const it = db.iterator({ gte, lte, keys: true, values: false });
      for await (const k of it) {
        if (results.length >= limit) break;
        const key = k as string;
        const parts = key.split("-");
        const leftRowId = parts.at(-1)!;
        const raw = await db.get(key);
        const leftData = JSON.parse(raw.toString());
        if (!matchFilters(leftData, whereLeft)) continue;
        const joinVal = leftData[leftKey];
        const matches = rightMap.get(joinVal);
        if (!matches) continue;
        for (const { rowId: rightRowId, data: rightData } of matches) {
          const row: any = {};
          // 左表 rowId
          row[`${leftTableId}.rowId`] = leftRowId;
          // 右表 rowId
          row[`${rightTableId}.rowId`] = rightRowId;
          // 左表字段
          for (const [col, val] of Object.entries(leftData)) {
            row[`${leftTableId}.${col}`] = val;
          }
          // 右表字段
          for (const [col, val] of Object.entries(rightData)) {
            row[`${rightTableId}.${col}`] = val;
          }
          results.push(row);
          if (results.length >= limit) break;
        }
      }
    }

    return results;
  },
};
