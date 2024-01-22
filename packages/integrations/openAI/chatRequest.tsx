import { AxiosResponse, AxiosRequestConfig } from "axios";
import axios from "utils/axios";

import { createOpenAIRequestConfig } from "./config";
import { FrontEndRequestBody } from "./types";

export const chatRequest = async (
  requestBody: FrontEndRequestBody,
  isStream: boolean,
): Promise<AxiosResponse<any> | null> => {
  const data = {
    model: requestBody.model || "gpt-3.5-turbo-16k",
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
  try {
    const response = await axios.request(config);
    return response;
  } catch (error) {
    console.error(error.message);
    return null;
  }
};
