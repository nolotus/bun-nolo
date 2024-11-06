import Anthropic from "@anthropic-ai/sdk";
import { pickMessages } from "ai/api/pickMessages";

export async function chatRequest(requestBody: any): Promise<any> {
  const { model, max_tokens } = requestBody;

  const messages = [
    ...(requestBody.previousMessages || []),
    {
      role: "user",
      content: requestBody.userInput,
    },
  ];

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = client.messages.stream({
    messages: pickMessages(messages),
    model,
    max_tokens,
    system: requestBody.prompt,
  });

  return response;
}
