// 文件路径: ai/tools/fetchWebpageTool.ts
import { selectCurrentServer } from "setting/settingSlice";

export const fetchWebpageTool = {
  type: "function",
  function: {
    name: "fetch_webpage",
    description: "访问指定网页并获取其内容以供 AI 使用",
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "要访问的网页 URL 地址",
        },
      },
      required: ["url"],
    },
  },
};

export const fetchWebpage = async (args, thunkApi, currentUserId) => {
  if (!args.url || typeof args.url !== "string") {
    throw new Error("访问网页失败：参数 url 必须为非空字符串");
  }

  try {
    const state = thunkApi.getState();
    const currentServer = selectCurrentServer(state);

    if (!currentServer) {
      throw new Error("访问网页失败：无法获取当前服务器地址");
    }

    const apiUrl = `${currentServer}/api/fetch-webpage`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: args.url }),
    });

    if (!response.ok) {
      throw new Error(`API 错误！状态码: ${response.status}`);
    }

    const data = await response.json();
    // 使用预览内容作为初始显示
    const contentPreview = data.preview;

    return {
      success: true,
      name: "网页内容获取",
      id: "webpage-fetch",
      text: `已成功获取网页内容 (URL: ${args.url})：\n\n${contentPreview}`,
      fullContent: data.fullContent, // 存储完整内容，供 AI 或用户进一步使用
    };
  } catch (error) {
    throw new Error(`访问网页失败：${error.message}`);
  }
};
