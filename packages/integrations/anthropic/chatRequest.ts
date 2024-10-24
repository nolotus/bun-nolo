import Anthropic from "@anthropic-ai/sdk";
import { pick, map } from "rambda";

export async function chatRequest(requestBody: any): Promise<any> {
  const { model, max_tokens } = requestBody;

  const messages = [
    // promptMessage,
    ...(requestBody.previousMessages || []),
    {
      role: "user",
      content: requestBody.userInput,
    },
  ];

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const messagePropertiesToPick = ["content", "role", "images"];
  const pickMessages = map(pick(messagePropertiesToPick));

  const response = client.messages.stream({
    messages: pickMessages(messages),
    model,
    max_tokens,
    system: requestBody.prompt,
  });

  return response;
}
