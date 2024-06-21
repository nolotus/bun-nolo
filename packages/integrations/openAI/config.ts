import { getProxyConfig } from "utils/getProxyConfig";

export const createOpenAIRequestConfig = () => {
  return {
    ...getProxyConfig(),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_KEY || ""}`,
    },
  };
};
export const openAIConfig = createOpenAIRequestConfig();
