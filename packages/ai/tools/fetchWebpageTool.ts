// /ai/tools/fetchWebpageTool.ts (已更新至新架构)

import type { RootState } from "app/store";
import { selectCurrentServer } from "app/settings/settingSlice";

/**
 * [Schema] 定义了 'fetchWebpage' 工具的结构，供 LLM 调用。
 */
export const fetchWebpageFunctionSchema = {
  // 已从 'fetch_webpage' 更新为 'fetchWebpage'
  name: "fetchWebpage",
  description: "访问指定的网页 URL，并提取其纯文本内容以供分析或总结。",
  parameters: {
    type: "object",
    properties: {
      url: {
        type: "string",
        description: "要抓取其内容的网页的完整 URL 地址。",
      },
    },
    required: ["url"],
  },
};

/**
 * (内部辅助函数) 截取文本并添加省略号，用于生成简洁的 displayData。
 */
function truncateText(text: string, maxLength = 200): string {
  if (!text) return "";
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + "...";
}

/**
 * [Executor] 'fetchWebpage' 工具的执行函数。
 * @param args - LLM 提供的参数: { url: string }
 * @param thunkApi - Redux Thunk API
 * @returns {Promise<{rawData: string, displayData: string}>} - 返回标准化的结果对象
 */
export async function fetchWebpageFunc(
  args: { url: string },
  thunkApi: any
): Promise<{ rawData: string; displayData: string }> {
  const { url } = args;
  if (!url || typeof url !== "string" || !url.startsWith("http")) {
    throw new Error(
      "访问网页失败：必须提供一个有效的、以 http 或 https 开头的 URL。"
    );
  }

  try {
    const state = thunkApi.getState() as RootState;
    const currentServer = selectCurrentServer(state);

    if (!currentServer) {
      throw new Error("访问网页失败：无法获取当前服务器配置。");
    }

    const apiUrl = `${currentServer}/api/fetch-webpage`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("API Error Response:", errorData);
      throw new Error(`API 请求失败，状态码: ${response.status}. ${errorData}`);
    }

    const data = await response.json();
    const fullContent = data.fullContent || data.preview || "";

    if (!fullContent) {
      return {
        rawData: `成功访问 URL: ${url}，但未能提取到任何有效内容。`,
        displayData: `已访问 URL: ${url}，但页面为空或无法提取内容。`,
      };
    }

    // 返回标准化的结果对象
    return {
      // 原始数据，供 plan 的后续步骤使用
      rawData: fullContent,
      // 用于UI展示的简洁数据
      displayData: `✅ 已成功获取网页内容 (URL: ${url})\n\n**内容预览:**\n${truncateText(
        fullContent
      )}`,
    };
  } catch (error: any) {
    console.error(`执行 fetchWebpage 时发生错误:`, error);
    // 重新抛出错误，以便上层可以捕获它
    throw new Error(`访问网页 (${url}) 失败：${error.message}`);
  }
}
