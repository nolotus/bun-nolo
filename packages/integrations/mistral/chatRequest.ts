import axios from "utils/axios";
import { getProxyConfig } from "utils/getProxyConfig";
import { NoloChatRequestBody } from "ai/types";

import { mistralModels } from "./models";
import { createMessages } from "ai/api/createMessages";

export async function sendMistralRequest(
  requestBody: NoloChatRequestBody,
  isStream: boolean,
): Promise<any> {
  const { model, max_tokens } = requestBody;
  const proxyConfig = getProxyConfig();

  const messages = createMessages(
    requestBody.userInput,
    requestBody.previousMessages,
    requestBody.prompt,
  );

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
      messages: messages,
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
