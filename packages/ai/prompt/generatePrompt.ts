// prompt/generateContent.js

import { mapLanguage } from "i18n/mapLanguage";

interface Contexts {
  currentUserContext?: string | null;
  smartReadContext?: string | null;
  historyContext?: string | null;
  preConfiguredContext?: string | null;
}

interface GeneratePromptOptions {
  prompt?: string;
  name?: string;
  language?: string; // 使用 language 替代 responseLanguage，更通用
  contexts?: Contexts;
}

/**
 * 辅助函数，用于生成单个上下文区块，如果内容为空则返回空字符串
 */
const createContextSection = (
  title: string,
  instructions: string,
  content: string | null | undefined
): string => {
  if (!content) return "";
  return `${title}:\n${instructions}\n\n${content}`;
};

export const generatePrompt = (options: GeneratePromptOptions = {}): string => {
  const {
    prompt = "",
    name = "",
    language = navigator.language,
    contexts = {},
  } = options;
  const mappedLanguage = mapLanguage(language);
  const currentTime = new Date().toLocaleString("en-US", { timeZone: "UTC" });

  // 👇 使用辅助函数生成每个区块
  const currentUserSection = createContextSection(
    "USER'S CURRENTLY ADDED REFERENCES",
    "(Your primary focus for the current request. These items were just provided by the user.)",
    contexts.currentUserContext
  );

  const smartReadSection = createContextSection(
    "SMART CONTEXT ANALYSIS",
    "(Based on the conversation, these items are likely highly relevant. Prioritize them after the user's current additions.)",
    contexts.smartReadContext
  );

  const historySection = createContextSection(
    "REFERENCES FROM CONVERSATION HISTORY",
    "(These items were mentioned or used in previous messages.)",
    contexts.historyContext
  );

  const preConfiguredSection = createContextSection(
    "PRE-CONFIGURED BOT REFERENCES",
    "(General knowledge and standard documents pre-assigned to this assistant.)",
    contexts.preConfiguredContext
  );

  // 👇 按优先级顺序组装所有部分
  const allSections = [
    name ? `Your name is ${name}.` : "",
    mappedLanguage ? `Response Language: ${mappedLanguage}.` : "",
    `Current time is ${currentTime}.`,

    // 上下文区块按优先级排列
    currentUserSection,
    smartReadSection,
    historySection,
    preConfiguredSection,

    "Please follow these instructions:",
    "Ensure the response content is well-formatted and easy for users to read.",
    prompt,
  ].filter((section) => section && section.trim() !== ""); // 过滤掉所有空部分

  return allSections.join("\n\n");
};
