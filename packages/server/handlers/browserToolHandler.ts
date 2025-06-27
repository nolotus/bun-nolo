import {
  createSession,
  getSessionPage,
} from "../services/browserSessionManager";

// 预设的CORS响应头
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const handleBrowserTool = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // 从请求体中解析出工具名称和参数
    const { toolName, params } = await req.json();
    if (!toolName || !params) {
      throw new Error("请求体中必须包含 'toolName' 和 'params'");
    }

    const { sessionId, url, selector, value } = params;
    let result: any;

    // 根据工具名称分发任务
    switch (toolName) {
      case "browser_openSession":
        if (!url) throw new Error("参数 'url' 是必须的");
        result = await createSession(url);
        break;

      case "browser_selectOption":
        if (!sessionId || !selector || value === undefined) {
          throw new Error("参数 'sessionId', 'selector', 'value' 都是必须的");
        }
        const page = getSessionPage(sessionId);
        // 在操作前等待网络空闲，增加稳定性
        await page.waitForLoadState("networkidle", { timeout: 15000 });
        await page.selectOption(selector, { value }, { timeout: 10000 });
        result = { status: `成功为 '${selector}' 选择了选项 '${value}'` };
        break;

      // 在这里为未来的工具（如 click, typeText）预留位置
      // case 'browser_click': ...

      default:
        throw new Error(`未知的浏览器工具: ${toolName}`);
    }

    // 返回成功结果
    return new Response(JSON.stringify({ data: result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error(`浏览器工具处理器错误:`, error);
    // 返回详细的错误信息
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};
