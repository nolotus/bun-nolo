import { createPromotMessage } from "ai/utils/createPromotMessage";
import { Message } from "../types";

export const createStreamRequestBody = (
  config: any,
  currentTextContent: string,
  prevMessages: Array<Message>,
) => {
  const model = config.model || "gpt-3.5-turbo-16k";
  const promotMessage = createPromotMessage(config);

  return {
    type: "stream",
    model,
    messages: [
      promotMessage,
      ...prevMessages,
      { role: "user", content: currentTextContent },
    ],
    temperature: config.temperature || 0.8,
    max_tokens: config.max_tokens || 4096,
    top_p: config.top_p || 0.9,
    frequency_penalty: config.frequency_penalty || 0,
    presence_penalty: config.presence_penalty || 0,
  };
};
