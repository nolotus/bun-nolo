// prompt/generateContent.js

import { mapLanguage } from "i18n/mapLanuage";

export const generatePrompt = (
  prompt: string,
  name?: string,
  responseLanguage?: string,
  context?: string
): string => {
  const mappedLanguage = mapLanguage(responseLanguage);
  const currentTime = new Date().toLocaleString("en-US", { timeZone: "UTC" });

  const nameSection = name ? `Your name is ${name}. ` : "";
  const languageSection = mappedLanguage
    ? `Response Language: ${mappedLanguage}. `
    : "";
  const timeSection = `Current time is ${currentTime}. `;

  let contextSection = "";
  if (context) {
    contextSection =
      `Context Information:\n${context}\n\n` +
      `INSTRUCTIONS FOR USING CONTEXT:\n` +
      `- Use the context to answer questions when possible.\n` +
      `- If the context has exact numbers or facts, use them as they are.\n` +
      `- Do not change or guess numbers or details not in the context.\n` +
      `- If information is missing, say: "This is not in the context."\n` +
      `- If context has conflicting details, note it clearly.\n`;
  }

  const instruction = "Please follow these instructions: ";

  return `${nameSection}${languageSection}${timeSection}${contextSection}${instruction}${prompt}`;
};
