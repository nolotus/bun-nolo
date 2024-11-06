import { createPromptMessage } from "../../prompt/createPromptMessage";
import { pickMessages } from "../pickMessages";

export const createOpenAIMessages = (
  model: string,
  userInput: string,
  previousMessages: [] | any,
  prompt: string,
) => {
  const promotMessage = createPromptMessage(model, prompt);
  const msgs = [
    promotMessage,
    ...(previousMessages || []),
    {
      role: "user",
      content: userInput,
    },
  ];

  return pickMessages(msgs);
};
