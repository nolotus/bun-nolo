import axios from "utils/axios";

import { getProxyConfig } from "utils/getProxyConfig";

export async function chatRequest(
  requestBody,
  isStream: boolean,
): Promise<any> {
  const { model, messages, max_tokens } = requestBody;
  const proxyConfig = getProxyConfig();
  let axiosConfig = {
    method: "POST",
    url: "https://api.anthropic.com/v1/messages",
    responseType: isStream ? "stream" : "json",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.CLAUDE_KEY,
      Accept: isStream ? "text/event-stream" : "application/json",
      "anthropic-version": "2023-06-01",
    },
    data: {
      model,
      messages,
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
