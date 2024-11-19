import { prepareMsgs } from "ai/messages/prepareMsgs";
import { createPromptMessage } from "ai/prompt/createPromptMessage";

export const createMessages = (model, content, prevMsgs, cybotConfig) => {
  const config = {
    ...cybotConfig,
    responseLanguage: navigator.language,
  };
  const promotMessage = createPromptMessage(model, config.prompt);
  const prepareMsgConfig = { model, promotMessage, prevMsgs, content };
  const messages = prepareMsgs(prepareMsgConfig);
  return messages;
};
