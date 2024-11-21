import { AxiosResponse, AxiosRequestConfig } from "axios";
import axios from "utils/axios";
import { adjustOpenAIFrequencyPenalty } from "integrations/openAI/adjust";
import { filter } from "rambda";
import { pickMessages } from "ai/api/pickMessages";

import { createOpenAIRequestConfig } from "./config";
export const createPromptMessage = (model, prompt) => {
  const isO1 = model === "o1-mini" || model === "o1-preview";
  const role = isO1 ? "user" : "system";
  return {
    role,
    content: prompt,
  };
};

export const createOpenAIMessages = (
  model: string,
  userInput: string,
  previousMessages: [] | any,
  prompt: string,
) => {
  const promotMessage = createPromptMessage(model, prompt);
  const msgs = [
    promotMessage,
    ...(previousMessages || []),
    {
      role: "user",
      content: userInput,
    },
  ];

  return pickMessages(msgs);
};

export const sendOpenAIRequest = async (
  requestBody,
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
