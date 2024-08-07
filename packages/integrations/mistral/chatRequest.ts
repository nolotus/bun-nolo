import axios from "utils/axios";

import { getProxyConfig } from "utils/getProxyConfig";
import { mistralModels } from "./models";

export async function chatRequest(
  requestBody,
  isStream: boolean,
): Promise<any> {
  const { model, messages, max_tokens } = requestBody;
  const proxyConfig = getProxyConfig();
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
