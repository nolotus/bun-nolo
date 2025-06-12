import jsonLogic from "json-logic-js";

export const transformRowsTool = {
  name: "transformRows",
  description:
    "对传入行数组按 JSON-Logic 子集做衍生字段计算、投影或条件映射，返回新行数组",
  parameters: {
    type: "object",
    properties: {
      rows: {
        type: "array",
        description: "输入行数组，元素可以是任意对象",
        items: { type: "object" },
      },
      mapping: {
        type: "object",
        description:
          "JSON-Logic 表达式，用于对每行计算或映射；返回值会组成新的数组元素",
      },
    },
    required: ["rows", "mapping"],
  },

  run: async (
    {
      rows,
      mapping,
    }: {
      rows: any[];
      mapping: any; // JSONLogicExpr
    },
    context: any
  ) => {
    // 对每行应用 JSON-Logic 表达式
    // 如果 mapping 生成对象，则返回对象；如果生成标量，则返回标量
    return rows.map((row) => jsonLogic.apply(mapping, row));
  },
};
