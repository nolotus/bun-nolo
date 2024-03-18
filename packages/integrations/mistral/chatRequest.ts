import axios from "utils/axios";

import { getProxyConfig } from "utils/getProxyConfig";

export async function chatRequest(
  requestBody,
  isStream: boolean,
): Promise<any> {
  const { model, messages, max_tokens } = requestBody;

  const proxyConfig = getProxyConfig();
  const axiosConfig = {
    method: "POST",
    url: "https://api.mistral.ai/v1/chat/completions",
    responseType: isStream ? "stream" : "json",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MISTRAL_KEY}`,
      Accept: isStream ? "text/event-stream" : "application/json",
    },
    data: {
      model,
      messages,
      stream: isStream, // 根据参数设置stream
      max_tokens,
    },
    ...proxyConfig,
  };

  try {
    const response = await axios(axiosConfig);

    return response;
  } catch (err) {
    console.error("axios error:", err);
    throw err;
  }
}
