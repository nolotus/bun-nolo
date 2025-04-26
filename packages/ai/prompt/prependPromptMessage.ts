import { Message } from "ai/types";
export const prependPromptMessage = (
  messages: Message[],
  promptContent: string
): Message[] => {
  if (promptContent.trim()) {
    // 确保 system message 结构符合 Message 接口
    const systemMessage: Message = { role: "system", content: promptContent };
    return [systemMessage, ...messages];
  }
  return messages;
};
