import axios from "utils/axios";
import { getProxyConfig } from "utils/getProxyConfig";
import { mistralModels } from "./models";

export async function sendMistralRequest(
  requestBody,
  isStream: boolean,
): Promise<any> {
  const { model, userInput, previousMessages, max_tokens } = requestBody;
  const proxyConfig = getProxyConfig();

  // 组合新的消息数组
  const messages = [
    ...(previousMessages || []), // 先添加之前的消息
    {
      role: "user", // 假设用户输入使用 "user" 角色
      content: userInput,
    },
  ];

  let axiosConfig = {
    method: "POST",
    url:
      model === mistralModels["codestral-latest"]
        ? "https://codestral.mistral.ai/v1/chat/completions"
        : "https://api.mistral.ai/v1/chat/completions",
    responseType: isStream ? "stream" : "json",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${model === mistralModels["codestral-latest"] ? process.env.CODESTRAL_KEY : process.env.MISTRAL_KEY}`,
      Accept: isStream ? "text/event-stream" : "application/json",
    },
    data: {
      model,
      messages, // 使用新的消息列表
      stream: isStream,
      max_tokens,
    },
    ...proxyConfig,
  };

  try {
    const response = await axios(axiosConfig);
    return response;
  } catch (err) {
    throw err;
  }
}
