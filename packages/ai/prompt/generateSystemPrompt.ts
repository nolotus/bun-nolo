import { generatePrompt } from "./generatePrompt";
export const generateSystemPrompt = (
  prompt: string | undefined,
  botName: string | undefined,
  language: string,
  context: any
): string => {
  // 确保 generatePrompt 能处理空 prompt
  return generatePrompt(prompt || "", botName, language, context);
};
