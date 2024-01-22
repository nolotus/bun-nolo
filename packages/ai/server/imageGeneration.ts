import axios from "utils/axios";

import { createOpenAIRequestConfig } from "integrations/openAI/config";

interface ImageGenerationsRequest {
  prompt: string;
  model?: string;
  n?: number;
  quality?: string;
  response_format?: string;
  size?: string;
  style?: string;
  user?: string;
}

export const handleImageGenerationsRequest = async (req, res) => {
  if (req.method === "POST") {
    try {
      const requestData: ImageGenerationsRequest = req.body;
      // 确保 prompt 参数存在且有效
      if (
        !requestData.prompt ||
        typeof requestData.prompt !== "string" ||
        requestData.prompt.length > 4000
      ) {
        throw new Error("Invalid or missing prompt");
      }

      // 使用默认值填充可选字段
      const completeRequestData = {
        model: requestData.model || "dall-e-2",
        n: requestData.n || 2,
        quality: requestData.quality || "standard",
        response_format: requestData.response_format || "url",
        size: requestData.size || "256x256",
        style: requestData.style || "vivid",
        prompt: requestData.prompt,
      };

      const config = createOpenAIRequestConfig();

      const requestConfig = {
        ...config,
        url: "https://api.openai.com/v1/images/generations", // 调整 URL 以符合图片生成接口
        method: "POST",
        responseType: "json", // 假设您希望以 JSON 格式接收响应
        data: completeRequestData, // 使用先前构建的请求体
      };

      const openAIResponse = await axios.request(requestConfig);

      // 返回响应
      console.log("openAIResponse", openAIResponse);
      return res.status(200).json({ data: openAIResponse.data });
    } catch (error) {
      console.error(error);
      // 返回一个错误响应
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    // 返回 405 Method Not Allowed 错误
    return res.status(405).json({ message: "Method Not Allowed" });
  }
};
