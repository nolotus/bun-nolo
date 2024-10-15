import axios from "utils/axios";
import { getProxyConfig } from "utils/getProxyConfig";
import { createPromptMessage } from "ai/prompt/createPromptMessage";
import { pick, map } from "rambda";
import { NoloChatRequestBody } from "ai/types";

import { mistralModels } from "./models";

const messagePropertiesToPick = ["content", "role", "images"];
const pickMessages = map(pick(messagePropertiesToPick));

export async function sendMistralRequest(
  requestBody: NoloChatRequestBody,
  isStream: boolean,
): Promise<any> {
  const { model, userInput, previousMessages, max_tokens } = requestBody;
  const proxyConfig = getProxyConfig();

  const promotMessage = createPromptMessage(
    requestBody.model,
    requestBody.prompt,
  );

  const messages = [
    promotMessage,
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
      messages: pickMessages(messages),

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
