// createMessages.js

import { generatePrompt } from "../prompt/generatePrompt";
import { pickMessages } from "./pickMessages";

export const createMessages = (
  userInput: string | any,
  prevMsgs,
  cybotConfig,
  context = ""
) => {
  const messages = [...prevMsgs, { role: "user", content: userInput }];

  if (cybotConfig.model.includes("o1-mini")) {
    return pickMessages(messages);
  }

  const role = cybotConfig.model.includes("o1") ? "develop" : "system";

  const promptContent = generatePrompt(
    cybotConfig.prompt || "",
    cybotConfig.name,
    navigator.language,
    context
  );

  messages.unshift({
    role: role,
    content: promptContent,
  });

  return pickMessages(messages);
};
