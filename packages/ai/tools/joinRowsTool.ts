export const joinRowsTool = {
  name: "joinRows",
  description: "内存中对两组任意行数组做等值内/左连接",
  parameters: {
    type: "object",
    properties: {
      left: {
        type: "array",
        description: "左侧行数组",
        items: { type: "object" },
      },
      right: {
        type: "array",
        description: "右侧行数组",
        items: { type: "object" },
      },
      on: {
        type: "object",
        description: "等值连接的键名",
        properties: {
          leftKey: { type: "string", description: "左侧用于连接的字段名" },
          rightKey: { type: "string", description: "右侧用于连接的字段名" },
        },
        required: ["leftKey", "rightKey"],
      },
      how: {
        type: "string",
        description: "连接方式：inner（内连接）或 left（左连接）",
        enum: ["inner", "left"],
      },
    },
    required: ["left", "right", "on", "how"],
  },

  run: async ({
    left,
    right,
    on: { leftKey, rightKey },
    how,
  }: {
    left: any[];
    right: any[];
    on: { leftKey: string; rightKey: string };
    how: "inner" | "left";
  }) => {
    // 先构建右侧索引
    const rightMap = new Map<any, any[]>();
    for (const r of right) {
      const key = r[rightKey];
      if (key === undefined) continue;
      const arr = rightMap.get(key) || [];
      arr.push(r);
      rightMap.set(key, arr);
    }

    const result: any[] = [];
    for (const l of left) {
      const key = l[leftKey];
      const matches = rightMap.get(key);
      if (matches && matches.length > 0) {
        // 对每个匹配的右侧行，生成一条合并记录
        for (const r of matches) {
          result.push({ ...l, ...r });
        }
      } else if (how === "left") {
        // 左连接：无匹配时也保留左侧行
        result.push({ ...l });
      }
    }

    return result;
  },
};
