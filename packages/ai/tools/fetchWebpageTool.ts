// 文件路径: ai/tools/fetchWebpageTool.ts
import { selectCurrentServer } from "setting/settingSlice";

export const fetchWebpageTool = {
  type: "function",
  function: {
    name: "fetch_webpage",
    description: "访问指定网页并获取其内容",
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

// 简单提取 HTML 中的纯文本内容（去除标签）
const extractTextFromHtml = (html: string): string => {
  // 去除 HTML 标签
  let text = html
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  // 进一步清理多余的换行和空格
  text = text.replace(/\n\s*\n/g, "\n").trim();
  return text;
};

export const fetchWebpage = async (args, thunkApi, currentUserId) => {
  // 参数简单验证
  if (!args.url || typeof args.url !== "string") {
    throw new Error("访问网页失败：参数 url 必须为非空字符串");
  }

  try {
    // 获取当前服务器地址作为前缀
    const state = thunkApi.getState();
    const dispatch = thunkApi.dispatch; // 保留以备后续可能的逻辑使用
    const currentServer = selectCurrentServer(state);

    if (!currentServer) {
      throw new Error("访问网页失败：无法获取当前服务器地址");
    }

    // 为 apiUrl 添加当前服务器地址作为前缀
    const apiUrl = `${currentServer}/api/fetch-webpage`;

    // 调用内部 API，而不是直接 fetch
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
    // 提取纯文本内容
    const contentText = extractTextFromHtml(data.content);
    // 限制显示长度（例如前 1000 个字符）
    const contentPreview =
      contentText.substring(0, 1000) +
      (contentText.length > 1000 ? "...（内容已截断）" : "");
    return {
      success: true, // 必须包含 success 属性且为 true
      name: "网页内容获取", // 用于显示
      id: "webpage-fetch", // 用于显示
      text: `已成功获取网页内容 (URL: ${args.url})：\n\n${contentPreview}`, // 确保内容预览被包含
    };
  } catch (error) {
    throw new Error(`访问网页失败：${error.message}`);
  }
};
