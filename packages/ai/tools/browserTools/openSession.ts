import { executeBrowserTool } from "./common";

// Schema: 给LLM看的说明书
export const browser_openSession_Schema = {
  name: "browser_openSession",
  description:
    "打开一个新的浏览器会话并导航到指定的URL。这是所有浏览器交互的第一步。它会返回一个唯一的 'sessionId'，后续所有浏览器操作都必须使用此ID。",
  parameters: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description:
          "要访问的完整、有效的URL，必须以 http:// 或 https:// 开头。",
      },
    },
    required: ["url"],
  },
};

// Executor: 实际执行函数
export async function browser_openSession_Func(
  args: { url: string },
  thunkApi: any
) {
  const result = await executeBrowserTool(
    "browser_openSession",
    args,
    thunkApi
  );

  // 返回给 plan 执行器的数据
  return {
    // rawData 是给下一步骤使用的关键数据
    rawData: result.sessionId,
    // displayData 是在UI中展示给用户看的信息
    displayData: `✅ 已成功打开会话并访问 ${args.url}。`,
  };
}
