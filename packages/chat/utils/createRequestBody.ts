import { pickMessages } from "ai/messages/pickMessages";
import { createPromotMessage } from "ai/messages/createPromotMessage";

import { pickAiRequstBody } from "ai/utils/pickAiRequstBody";

export const createRequestBody = (config) => {
  const { model, prevMessages, message } = config;

  const promotMessage = createPromotMessage(config);

  const body = {
    type: "vision",
    model,
    messages: pickMessages([promotMessage, ...prevMessages, message]),
    temperature: config.temperature || 0.8,
    max_tokens: config.max_tokens || 4096,
    top_p: config.top_p || 0.9,
    frequency_penalty: config.frequency_penalty || 0,
    presence_penalty: config.presence_penalty || 0,
  };
  console.log("body", body);

  const result = {
    ...pickAiRequstBody(body),
    messages: pickMessages(body.messages),
  };
  console.log("result", result);

  return result;
};
