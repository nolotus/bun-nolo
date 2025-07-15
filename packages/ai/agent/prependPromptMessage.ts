import { Agent, Message } from "app/types";
import { Contexts } from "../types";
import { generatePrompt } from "ai/agent/generatePrompt";

export const prependPromptMessage = (
  messages: Message[],
  agentConfig: Agent,
  language: string,
  contexts?: Contexts
): Message[] => {
  // 只有存在上下文或 agentConfig.prompt 时才生成
  if (!contexts && !agentConfig.prompt) {
    return messages;
  }

  const promptContent = generatePrompt({ agentConfig, language, contexts });

  if (promptContent.trim()) {
    const systemMessage: Message = { role: "system", content: promptContent };
    // 过滤掉已有的 system 消息，避免重复
    const userMessages = messages.filter((m) => m.role !== "system");
    return [systemMessage, ...userMessages];
  }
  return messages;
};
