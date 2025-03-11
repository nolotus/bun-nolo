import { pickMessages } from "ai/api/pickMessages";
import { generatePrompt } from "ai/prompt/generatePrompt";

export function generateRequestBody(
  cybotConfig,
  content,
  prevMsgs,
  context = ""
) {
  const model = cybotConfig.model;
  const messages = [
    ...(prevMsgs || []),
    {
      role: "user",
      content,
    },
  ];

  const promptContent = generatePrompt(
    cybotConfig.prompt || "",
    cybotConfig.name,
    navigator.language,
    context // Pass the context directly (assumed to be pre-fetched)
  );

  const bodyData = {
    model,
    max_tokens: 8000,
    messages: pickMessages(messages),
    stream: true,
    system: promptContent,
  };
  return JSON.stringify(bodyData);
}
