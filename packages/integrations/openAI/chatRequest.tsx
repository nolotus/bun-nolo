import { AxiosResponse, AxiosRequestConfig } from "axios";
import axios from "utils/axios";
import { adjustOpenAIFrequencyPenalty } from "integrations/openAI/adjust";
import { filter } from "rambda";

import { createOpenAIRequestConfig } from "./config";
import { NoloChatRequestBody } from "ai/types";
import { createOpenAIMessages } from "ai/api/openai/createMessages";

export const sendOpenAIRequest = async (
  requestBody: NoloChatRequestBody,
  isStream: boolean,
): Promise<AxiosResponse<any> | null> => {
  if (!requestBody.model) {
    return null;
  }

  requestBody.frequency_penalty = adjustOpenAIFrequencyPenalty(
    requestBody.frequency_penalty,
  );

  const messages = createOpenAIMessages(
    requestBody.model,
    requestBody.userInput,
    requestBody.previousMessages,
    requestBody.prompt,
  );
  const isO1 =
    requestBody.model === "o1-mini" || requestBody.model === "o1-preview";
  console.log("requestBody", requestBody);

  const openAIConfig = filter((value) => value != null, {
    model: requestBody.model,
    messages: messages,
    stream: isO1 ? false : isStream,
    max_completion_tokens: requestBody.max_tokens,
    tools: requestBody.tools,
  });

  const config: AxiosRequestConfig = {
    ...createOpenAIRequestConfig(),
    url: "https://api.openai.com/v1/chat/completions",
    method: "POST",
    responseType: openAIConfig.stream ? "stream" : "json",
    data: openAIConfig,
  };

  try {
    const response = await axios.request(config);
    return response;
  } catch (error) {
    console.log("error", error.message);
    return null;
  }
};
