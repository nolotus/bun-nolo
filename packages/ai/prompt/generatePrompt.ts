// prompt/generateContent.js

import { mapLanguage } from "i18n/mapLanguage";

interface GeneratePromptOptions {
  prompt?: string;
  name?: string;
  responseLanguage?: string;
  context?: string | null; // <--- 修改点 1: 接受 null
}

export const generatePrompt = (options: GeneratePromptOptions = {}): string => {
  const {
    prompt = "",
    name = "",
    responseLanguage = "",
    context = null, // <--- 修改点 2: 默认值为 null
  } = options;
  const mappedLanguage = mapLanguage(responseLanguage);
  const currentTime = new Date().toLocaleString("en-US", { timeZone: "UTC" });

  const sections = [
    name ? `Your name is ${name}.` : "",
    mappedLanguage ? `Response Language: ${mappedLanguage}.` : "",
    `Current time is ${currentTime}.`,
    // *** 关键改动在这里 ***
    // 如果 context 为 null 或空字符串，generateContextSection 不会被调用
    context ? generateContextSection(context) : "",
    "Please follow these instructions:",
    "Ensure the response content is well-formatted and easy for users to read.",
    prompt,
  ].filter((section) => section !== "");

  return sections.join("\n\n");
};

// generateContextSection 现在只在确定有 context 时才被调用
const generateContextSection = (context: string): string => {
  // 注意：标题 "Context Information:" 已经移到了 fetchReferenceContents 中
  // 这样可以确保标题和内容是原子性的
  return (
    `${context}\n\n` + // 直接使用传入的 context
    `INSTRUCTIONS FOR USING CONTEXT:\n` +
    `- Prioritize using the context to answer questions when applicable.\n` +
    `- If the context has exact numbers or facts, use them as they are.\n` +
    `- Do not change or guess numbers or details provided in the context.\n` +
    `- If information is not found in the context, feel free to use your knowledge to provide a helpful response.\n` +
    `- If context has conflicting details, note it clearly.`
  );
};
