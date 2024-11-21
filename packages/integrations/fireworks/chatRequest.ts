import { AxiosResponse, AxiosRequestConfig } from "axios";
import axios from "utils/axios";
import { adjustOpenAIFrequencyPenalty } from "integrations/openAI/adjust";
import { getProxyConfig } from "utils/getProxyConfig";
import { createMessages } from "ai/api/createMessages";

export const sendFireworksChatRequest = async (
  apiKey,
  requestBody,
  isStream: boolean,
): Promise<AxiosResponse<any> | null> => {
  if (!requestBody.model) {
    return null;
  }
  requestBody.frequency_penalty = adjustOpenAIFrequencyPenalty(
    requestBody.frequency_penalty,
  );

  const messages = createMessages(
    requestBody.userInput,
    requestBody.previousMessages,
    requestBody.prompt,
  );
  const requestData = {
    model: requestBody.model,
    messages,
    stream: isStream,
    max_completion_tokens: requestBody.max_tokens,
  };

  const config: AxiosRequestConfig = {
    url: "https://api.fireworks.ai/inference/v1/chat/completions",
    method: "POST",
    responseType: requestData.stream ? "stream" : "json",
    data: requestData,
    ...getProxyConfig(),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  };

  try {
    const response = await axios.request(config);

    return response;
  } catch (error) {
    // console.log("error", error);
    return null;
  }
};
