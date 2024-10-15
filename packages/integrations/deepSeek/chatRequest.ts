import axios from "utils/axios";
import { baseLogger } from "utils/logger";
import { createPromptMessage } from "ai/prompt/createPromptMessage";
import { pick, map } from "rambda";

export async function chatRequest(
  requestBody,
  isStream: boolean,
): Promise<any> {
  if (!requestBody.model) {
    baseLogger.error("Model is required.");
    return null;
  }
  const promotMessage = createPromptMessage(
    requestBody.model,
    requestBody.prompt,
  );
  const messages = [
    promotMessage,
    ...(requestBody.previousMessages || []),
    {
      role: "user",
      content: requestBody.userInput,
    },
  ];
  const messagePropertiesToPick = ["content", "role", "images"];
  const pickMessages = map(pick(messagePropertiesToPick));
  const { model, max_tokens } = requestBody;
  const data = {
    model,
    messages: pickMessages(messages),
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
