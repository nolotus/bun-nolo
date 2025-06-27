import { executeBrowserTool } from "./common";

// Schema
export const browser_selectOption_Schema = {
  name: "browser_selectOption",
  description:
    "在当前浏览器会话中，为一个 <select> 下拉框元素选择一个指定的选项。",
  parameters: {
    type: "object",
    properties: {
      sessionId: {
        type: "string",
        description: "必需。由 'browser_openSession' 工具返回的会话ID。",
      },
      selector: {
        type: "string",
        description:
          "必需。目标 <select> 元素的CSS选择器，例如 'select#country' 或 'select[name=\"country\"]'。",
      },
      value: {
        type: "string",
        description:
          "必需。要选择的 <option> 元素的 value 属性值。例如 'CN' 或 'USA'。",
      },
    },
    required: ["sessionId", "selector", "value"],
  },
};

// Executor
export async function browser_selectOption_Func(
  args: { sessionId: string; selector: string; value: string },
  thunkApi: any
) {
  const result = await executeBrowserTool(
    "browser_selectOption",
    args,
    thunkApi
  );

  return {
    // 此步骤通常不产生给下一步的数据，返回一个状态即可
    rawData: result.status,
    displayData: `✅ 成功选择选项: \`${args.value}\` 应用于元素 \`${args.selector}\``,
  };
}
