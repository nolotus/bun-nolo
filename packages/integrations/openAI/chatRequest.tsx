import { AxiosResponse, AxiosRequestConfig } from "axios";
import axios from "utils/axios";

import { createOpenAIRequestConfig } from "./config";
import { FrontEndRequestBody } from "./types";
import { baseLogger } from "utils/logger";

export const chatRequest = async (
  requestBody: FrontEndRequestBody,
  isStream: boolean,
): Promise<AxiosResponse<any> | null> => {
  const data = {
    model: requestBody.model,
    messages: requestBody.messages,
    stream: isStream,
    max_tokens: requestBody.max_tokens,
  };
  const config: AxiosRequestConfig = {
    ...createOpenAIRequestConfig(),
    url: "https://api.openai.com/v1/chat/completions",
    method: "POST",
    responseType: isStream ? "stream" : "json",
    data,
  };

  baseLogger.info(config);
  try {
    const response = await axios.request(config);
    return response;
  } catch (error) {
    baseLogger.error(error);
    return null;
  }
};
