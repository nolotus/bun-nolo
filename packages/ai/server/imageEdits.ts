import axios from "utils/axios";

import { createOpenAIRequestConfig } from "integrations/openAI/config";

interface ImageEditsRequest {
  image: File; // 请确保这里的类型与您的实际情况相符
  prompt: string;
  mask?: File;
  model?: string;
  n?: number;
  size?: string;
  response_format?: string;
  user?: string;
}

export const handleImageEditsRequest = async (req, res) => {
  if (req.method === "POST") {
    try {
      const requestData: ImageEditsRequest = req.body;

      // 验证必要字段
      if (
        !requestData.image ||
        typeof requestData.prompt !== "string" ||
        requestData.prompt.length > 1000
      ) {
        throw new Error("Invalid or missing image/prompt");
      }

      // 构建请求体
      const formData = new FormData();
      formData.append("image", requestData.image);
      formData.append("prompt", requestData.prompt);
      if (requestData.mask) {
        formData.append("mask", requestData.mask);
      }
      formData.append("model", requestData.model || "dall-e-2");
      formData.append("n", requestData.n?.toString() || "1");
      formData.append("size", requestData.size || "1024x1024");
      formData.append("response_format", requestData.response_format || "url");
      if (requestData.user) {
        formData.append("user", requestData.user);
      }

      const config = createOpenAIRequestConfig();
      config.headers["Content-Type"] = "multipart/form-data";

      // 发送请求到 OpenAI API
      const openAIResponse = await axios.post(
        "https://api.openai.com/v1/images/edits",
        formData,
        config,
      );

      return res.status(200).json({ data: openAIResponse.data });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
};
