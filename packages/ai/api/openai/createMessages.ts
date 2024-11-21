import { pickMessages } from "../pickMessages";
export const createPromptMessage = (model, prompt) => {
  const isO1 = model === "o1-mini" || model === "o1-preview";
  const role = isO1 ? "user" : "system";
  return {
    role,
    content: prompt,
  };
};

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
