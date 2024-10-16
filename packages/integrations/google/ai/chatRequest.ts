import { NoloChatRequestBody } from "ai/types";
import axios from "axios";
import { IncomingMessage } from "http";
import { getProxyConfig } from "utils/getProxyConfig"; // 导入 getProxyConfig

interface Part {
  text: string;
}

interface Content {
  role: string;
  parts: Part[];
}

export async function streamGenerateGeminiContent(
  apiKey: string,
  userInput: string,
  previousMessages: Content[],
  model: string | null = null,
  prompt: string,
) {
  const requestBody = {
    contents: [
      ...previousMessages,
      {
        role: "user",
        parts: [
          {
            text: userInput,
          },
        ],
      },
    ],
    systemInstruction: {
      role: "user",
      parts: [
        {
          text: prompt,
        },
      ],
    },
    generationConfig: {
      temperature: 1,
      topK: 64,
      topP: 0.95,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    },
  };

  const modelName = model || "gemini-1.5-flash";
  try {
    const proxyConfig = getProxyConfig(); // 获取代理配置
    const response = await axios.post<IncomingMessage>(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${apiKey}`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
        },
        responseType: "stream",
        ...proxyConfig, // 添加代理配置
      },
    );
    return response;
  } catch (error) {
    console.error("生成流内容时出错:", error);
  }
}

export function sendGeminiChatRequest(
  apiKey: string,
  noloRequestBody: NoloChatRequestBody,
) {
  const { model, previousMessages, userInput, prompt } = noloRequestBody;
  const contents: Content[] = [];

  if (previousMessages) {
    previousMessages.forEach((message) => {
      const role = message.role === "assistant" ? "model" : message.role;
      contents.push({
        role: role,
        parts: [{ text: message.content }],
      });
    });
  }

  return streamGenerateGeminiContent(
    apiKey,
    userInput,
    contents,
    model,
    prompt,
  );
}
