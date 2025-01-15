import { pickMessages } from "ai/api/pickMessages";

// 生成请求体数据

export function generateRequestBody(cybotConfig, content, prevMsgs) {
  const model = cybotConfig.model;
  const messages = [
    ...(prevMsgs || []),
    {
      role: "user",
      content,
    },
  ];

  const bodyData = {
    model,
    max_tokens: 8000,
    messages: pickMessages(messages),
    stream: true,
    system: cybotConfig.prompt,
  };
  return JSON.stringify(bodyData);
}
