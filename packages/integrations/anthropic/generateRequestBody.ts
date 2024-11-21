import { pickMessages } from "ai/api/pickMessages";

// 生成请求体数据

export function generateRequestBody(cybotConfig, content, prevMsgs) {
  const model = cybotConfig.model;
  console.log("prevMsgs", prevMsgs);
  console.log("cybotConfig", cybotConfig);
  const messages = [
    ...(prevMsgs || []),
    {
      role: "user",
      content,
    },
  ];
  console.log("messages", messages);

  const bodyData = {
    model,
    max_tokens: 8000,
    messages: pickMessages(messages),
    stream: true,
    system: cybotConfig.prompt,
  };
  return JSON.stringify(bodyData);
}
