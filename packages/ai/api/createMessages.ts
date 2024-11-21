export const createMessages = (model, content, prevMsgs, cybotConfig) => {
  const config = {
    ...cybotConfig,
    responseLanguage: navigator.language,
  };

  const messages = [
    {
      role: "system",
      content: prompt,
    },
    ...prevMsgs,
    { role: "user", content },
  ];
  return messages;
};
