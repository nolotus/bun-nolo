import { prepareMsgs } from "ai/messages/prepareMsgs";
import { mapLanguage } from "i18n/mapLanuage";

import { Message } from "../types";

export const createPromotMessage = (config) => {
  const { name, responseLanguage, prompt } = config;
  const mappedLanguage = mapLanguage(responseLanguage);

  const nameSection = name ? `Your name is ${name}. ` : "";
  const languageSection = mappedLanguage
    ? `Response Language: ${mappedLanguage}`
    : "";

  const metaContent = `${nameSection}${languageSection}`;
  const content = `${metaContent}${prompt}`;

  return {
    role: "system",
    content,
  };
};
export const createStreamRequestBody = (
  config: any,
  content: string,
  prevMsgs: Array<Message>,
) => {
  const model = config.model;
  const promotMessage = createPromotMessage(config);

  const prepareMsgConfig = { model, promotMessage, prevMsgs, content };

  const messages = prepareMsgs(prepareMsgConfig);

  return {
    type: "stream",
    model,
    messages,
    temperature: config.temperature || 0.8,
    max_tokens: config.max_tokens || 4096,
    top_p: config.top_p || 0.9,
    frequency_penalty: config.frequency_penalty || 0,
    presence_penalty: config.presence_penalty || 0,
  };
};
