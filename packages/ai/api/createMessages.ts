import { pickMessages } from "./pickMessages";

export const createMessages = (content, prevMsgs, cybotConfig) => {
  const messages = [
    {
      role: "system",
      content: cybotConfig.prompt,
    },
    ...prevMsgs,
    { role: "user", content },
  ];
  return pickMessages(messages);
};
