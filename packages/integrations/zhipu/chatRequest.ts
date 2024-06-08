import axios from "utils/axios";

import { getProxyConfig } from "utils/getProxyConfig";
// import { zhipuModels } from "./models";

export async function chatRequest(
  requestBody,
  isStream: boolean,
): Promise<any> {
  const { model, messages, max_tokens } = requestBody;
  const proxyConfig = getProxyConfig(false);
  let axiosConfig = {
    method: "POST",
    url: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
    responseType: isStream ? "stream" : "json",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ZHIPU_KEY}`,
      Accept: isStream ? "text/event-stream" : "application/json",
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
    console.error("axios error:", err);
    throw err;
  }
}
