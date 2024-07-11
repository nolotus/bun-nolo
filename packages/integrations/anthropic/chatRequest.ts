import Anthropic from "@anthropic-ai/sdk";
import { baseLogger } from "utils/logger";

export async function chatRequest(requestBody: any): Promise<any> {
  const { model, messages, max_tokens } = requestBody;

  const systemContents = messages
    .filter((message) => message.role === "system")
    .map((message) => message.content);
  baseLogger.info(systemContents);

  const filteredMessages = messages.filter(
    (message) => message.role !== "system",
  );

  baseLogger.info(filteredMessages);

  const client = new Anthropic();
  const response = client.messages.stream({
    messages: filteredMessages,
    model,
    max_tokens,
  });

  return response;
}
