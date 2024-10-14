import { Message } from "../types";
import { generateContent } from "../prompt/generateContent";

export const createStreamRequestBody = (
  config: any,
  userInput: string,
  previousMessages: Array<Message>,
) => {
  const model = config.model;
  const prompt = generateContent(
    config.prompt,
    config.name,
    config.responseLanguage,
  );
  return {
    type: "stream",
    model,
    temperature: config.temperature || 0.8,
    max_tokens: config.max_tokens || 4096,
    top_p: config.top_p || 0.9,
    frequency_penalty: config.frequency_penalty || 0,
    presence_penalty: config.presence_penalty || 0,
    previousMessages,
    userInput,
    prompt,
  };
};
