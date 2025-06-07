// prompt/generateContent.js

import { mapLanguage } from "i18n/mapLanguage";

interface GeneratePromptOptions {
  prompt?: string;
  name?: string;
  responseLanguage?: string;
  context?: string;
}

export const generatePrompt = (options: GeneratePromptOptions = {}): string => {
  const {
    prompt = "",
    name = "",
    responseLanguage = "",
    context = "",
  } = options;
  const mappedLanguage = mapLanguage(responseLanguage);
  const currentTime = new Date().toLocaleString("en-US", { timeZone: "UTC" });

  const sections = [
    name ? `Your name is ${name}.` : "",
    mappedLanguage ? `Response Language: ${mappedLanguage}.` : "",
    `Current time is ${currentTime}.`,
    context ? generateContextSection(context) : "",
    "Please follow these instructions:",
    "Ensure the response content is well-formatted and easy for users to read.",
    prompt,
  ].filter((section) => section !== "");

  return sections.join("\n\n");
};

const generateContextSection = (context: string): string => {
  return (
    `Context Information:\n${context}\n\n` +
    `INSTRUCTIONS FOR USING CONTEXT:\n` +
    `- Prioritize using the context to answer questions when applicable.\n` +
    `- If the context has exact numbers or facts, use them as they are.\n` +
    `- Do not change or guess numbers or details provided in the context.\n` +
    `- If information is not found in the context, feel free to use your knowledge to provide a helpful response.\n` +
    `- If context has conflicting details, note it clearly.`
  );
};
