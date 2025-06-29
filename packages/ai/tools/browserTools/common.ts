import type { RootState } from "app/store";
import { selectCurrentServer } from "app/settings/settingSlice";

/**
 * 调用统一的后端浏览器工具API端点。
 * @param toolName - 要调用的工具名称 (例如 'browser_openSession')。
 * @param parameters - 传递给工具的参数。
 * @param thunkApi - Redux Thunk API。
 * @returns 后端返回的执行结果。
 */
export async function executeBrowserTool(
  toolName: string,
  parameters: any,
  thunkApi: any
): Promise<any> {
  const { getState } = thunkApi;
  const state = getState() as RootState;
  const currentServer = selectCurrentServer(state);

  if (!currentServer) {
    throw new Error("浏览器操作失败：无法获取当前服务器配置。");
  }

  // 这是我们在后端设置的统一API端点
  const apiUrl = `${currentServer}/api/browser-tool`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolName, params: parameters }),
    });

    const result = await response.json();

    if (!response.ok) {
      // 从后端获取详细的错误信息并抛出
      throw new Error(
        result.error || `API 请求失败，状态码: ${response.status}`
      );
    }

    return result.data;
  } catch (error: any) {
    console.error(`执行浏览器工具 '${toolName}' 时发生网络或解析错误:`, error);
    // 重新抛出错误，以便上层（如runPlanSteps）可以捕获
    throw new Error(`浏览器工具 '${toolName}' 失败: ${error.message}`);
  }
}
