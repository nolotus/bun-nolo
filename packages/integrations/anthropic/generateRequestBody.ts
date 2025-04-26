import { generatePrompt } from "ai/prompt/generatePrompt";
import { pipe, flatten, filter, reverse, map } from "rambda";
import { NoloRootState } from "app/store";
import { selectMsgs } from "chat/messages/messageSlice";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string | { type: string; data: string }[];
  userId?: string;
}

interface CybotConfig {
  provider: string;
  model: string;
  prompt?: string;
  name?: string;
  [key: string]: any;
}

const filterValidMessages = (
  msgs: any
): { role: "user" | "assistant"; content: string }[] => {
  return pipe(
    flatten,
    filter((msg: Message | null) => {
      if (!msg) return false;
      if (Array.isArray(msg.content)) {
        return msg.content.some((item) => !!item.data);
      }
      return msg.content != null && msg.content.trim() !== "";
    }),
    reverse,
    map((msg: Message) => ({
      role: msg.role,
      content: normalizeContent(msg.content),
    }))
  )([msgs]) as { role: "user" | "assistant"; content: string }[];
};

const normalizeContent = (
  content: string | { type: string; data: string }[]
): string => {
  return typeof content === "string"
    ? content
    : Array.isArray(content)
      ? content
          .map((item) => item.data)
          .filter(Boolean)
          .join("\n")
      : String(content);
};

const createUserMessage = (
  userInput: string | { type: string; data: string }[]
): { role: "user"; content: string } => {
  return {
    role: "user",
    content: normalizeContent(userInput),
  };
};

const generateSystemPrompt = (
  prompt: string | undefined,
  botName: string | undefined,
  language: string,
  context: any
): string => {
  return generatePrompt(prompt || "", botName, language, context);
};

const buildRequestBody = (
  model: string,
  messages: { role: "user" | "assistant"; content: string }[],
  systemPrompt: string
): any => {
  return {
    model,
    max_tokens: 8000,
    messages,
    stream: true,
    system: systemPrompt,
  };
};

export const generateAnthropicRequestBody = (
  state: NoloRootState,
  userInput: string | { type: string; data: string }[],
  cybotConfig: CybotConfig,
  context: any
) => {
  const previousMessages = filterValidMessages(selectMsgs(state));
  const newUserMessage = createUserMessage(userInput);
  const conversationMessages = [...previousMessages, newUserMessage];

  const systemPrompt = generateSystemPrompt(
    cybotConfig.prompt,
    cybotConfig.name,
    navigator.language,
    context
  );
  console.log("Generated systemPrompt with context:", systemPrompt);

  const requestBody = buildRequestBody(
    cybotConfig.model,
    conversationMessages,
    systemPrompt
  );

  console.log("Final Anthropic requestBody:", requestBody);
  return requestBody;
};
