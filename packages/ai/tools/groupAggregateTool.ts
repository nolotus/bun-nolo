import { rowKey } from "database/keys";

type FilterExpr = {
  column: string;
  op: "=" | "!=" | ">" | ">=" | "<" | "<=" | "in" | "notIn";
  value: any;
};

type AggDef = {
  func: "COUNT" | "SUM" | "AVG" | "MIN" | "MAX";
  column?: string;
  filter?: FilterExpr;
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

export const groupAggregateTool = {
  name: "groupAggregate",
  description: "对满足条件的行执行分组聚合，一次返回多种指标",
  parameters: {
    type: "object",
    properties: {
      tenantId: { type: "string", description: "租户 ID" },
      tableId: { type: "string", description: "表 ID" },
      filters: {
        type: "array",
        description: "行级过滤条件",
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
      groupBy: {
        type: "array",
        description: "分组字段列表，留空表示不分组（整体聚合）",
        items: { type: "string" },
        default: [],
      },
      aggregations: {
        type: "object",
        description: "聚合指标定义，key 为输出别名",
        additionalProperties: {
          type: "object",
          properties: {
            func: {
              type: "string",
              enum: ["COUNT", "SUM", "AVG", "MIN", "MAX"],
            },
            column: {
              type: "string",
              description: "聚合字段（SUM/AVG/MIN/MAX）",
            },
            filter: {
              type: "object",
              description: "该指标的二次过滤条件",
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
          },
          required: ["func"],
        },
      },
    },
    required: ["tenantId", "tableId", "aggregations"],
  },

  run: async (
    {
      tenantId,
      tableId,
      filters = [],
      groupBy = [],
      aggregations,
    }: {
      tenantId: string;
      tableId: string;
      filters?: FilterExpr[];
      groupBy?: string[];
      aggregations: Record<string, AggDef>;
    },
    { db }: { db: any }
  ) => {
    // 扫描整表
    const { gte, lte } = rowKey.range(tenantId, tableId);
    const it = db.iterator({ gte, lte, keys: true, values: false });

    type Accumulator = {
      // 存放各种聚合的中间值
      [alias: string]:
        | number
        | { sum: number; count: number }
        | number /* 用于 MIN/MAX 起始值 */;
    };

    // 分组 map：key -> { groupVals, accs }
    const groups = new Map<
      string,
      { groupVals: Record<string, any>; accs: Accumulator }
    >();

    for await (const key of it) {
      const k = key as string;
      // 解析 rowId
      const parts = k.split("-");
      const rowId = parts.at(-1)!;
      // 读取行数据
      const raw = await db.get(k);
      const data = JSON.parse(raw.toString());

      // 应用全局 filters
      let ok = true;
      for (const f of filters) {
        if (!matchFilter(data, f)) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;

      // 计算分组 key 与分组值
      let mapKey = "__ALL__";
      const groupVals: Record<string, any> = {};
      if (groupBy.length > 0) {
        const partsKey: string[] = [];
        for (const col of groupBy) {
          const v = data[col];
          partsKey.push(`${col}:${String(v)}`);
          groupVals[col] = v;
        }
        mapKey = partsKey.join("|");
      }

      // 初始化分组累加器
      if (!groups.has(mapKey)) {
        const accs: Accumulator = {};
        for (const alias in aggregations) {
          const def = aggregations[alias];
          switch (def.func) {
            case "COUNT":
              accs[alias] = 0;
              break;
            case "SUM":
              accs[alias] = 0;
              break;
            case "AVG":
              accs[alias] = { sum: 0, count: 0 };
              break;
            case "MIN":
              accs[alias] = Infinity;
              break;
            case "MAX":
              accs[alias] = -Infinity;
              break;
          }
        }
        groups.set(mapKey, { groupVals, accs });
      }

      // 更新各指标
      const bucket = groups.get(mapKey)!;
      for (const alias in aggregations) {
        const def = aggregations[alias];
        // 如果该指标有二次过滤，则先检查
        if (def.filter && !matchFilter(data, def.filter)) continue;
        const col = def.column!;
        const rawVal = col ? data[col] : undefined;
        const acc = bucket.accs[alias];

        switch (def.func) {
          case "COUNT":
            bucket.accs[alias] = (acc as number) + 1;
            break;
          case "SUM":
            if (typeof rawVal === "number") {
              bucket.accs[alias] = (acc as number) + rawVal;
            }
            break;
          case "AVG":
            if (typeof rawVal === "number") {
              const obj = acc as { sum: number; count: number };
              obj.sum += rawVal;
              obj.count += 1;
            }
            break;
          case "MIN":
            if (typeof rawVal === "number") {
              bucket.accs[alias] = Math.min(acc as number, rawVal);
            }
            break;
          case "MAX":
            if (typeof rawVal === "number") {
              bucket.accs[alias] = Math.max(acc as number, rawVal);
            }
            break;
        }
      }
    }

    // 输出结果
    const result: any[] = [];
    for (const { groupVals, accs } of groups.values()) {
      const row: any = {};
      if (groupBy.length > 0) {
        row.group = groupVals;
      }
      for (const alias in aggregations) {
        const def = aggregations[alias];
        const acc = accs[alias];
        if (def.func === "AVG") {
          const obj = acc as { sum: number; count: number };
          row[alias] = obj.count > 0 ? obj.sum / obj.count : 0;
        } else {
          row[alias] = acc;
        }
      }
      result.push(row);
    }

    return result;
  },
};
