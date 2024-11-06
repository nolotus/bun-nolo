import axios from "utils/axios";
import { createOpenAIMessages } from "ai/api/openai/createMessages";

export async function sendDeepSeekRequest(
  requestBody,
  isStream: boolean,
): Promise<any> {
  if (!requestBody.model) {
    return null;
  }

  const { model, max_tokens } = requestBody;

  const messages = createOpenAIMessages(
    requestBody.model,
    requestBody.userInput,
    requestBody.previousMessages,
    requestBody.prompt,
  );
  const data = {
    model,
    messages: messages,
    stream: isStream,
    max_tokens,
  };
  const axiosConfig = {
    method: "POST",
    url: "https://api.deepseek.com/chat/completions",
    responseType: isStream ? "stream" : "json",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_KEY}`,
      Accept: isStream ? "text/event-stream" : "application/json",
    },
    data,
  };

  try {
    const response = await axios(axiosConfig);

    return response;
  } catch (err) {
    throw err;
  }
}
