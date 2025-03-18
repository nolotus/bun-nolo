import { pipe, flatten, filter, reverse, map } from "rambda";
import { NoloRootState } from "app/store";
import { generatePrompt } from "ai/prompt/generatePrompt";

interface CybotConfig {
  provider: string;
  model: string;
  prompt?: string;
  name?: string;
  [key: string]: any;
}

interface Message {
  id: string;
  role: string;
  content: string | { type: string; data: string }[];
  images?: any;
  userId?: string;
}

enum ModelType {
  Standard = "standard",
  Reasoning = "reasoning",
  MinimalReasoning = "minimalReasoning",
}

const filterValidMessages = (msgs: any): Message[] => {
  return pipe(
    flatten,
    filter((msg: Message | null) => {
      if (!msg) return false;
      if (Array.isArray(msg.content)) {
        return msg.content.some((item) =>
          item.type === "text" ? item.data?.trim() !== "" : !!item.data
        );
      }
      return msg.content != null && msg.content.trim() !== "";
    }),
    reverse,
    map((msg: Message) => ({
      role: msg.role,
      content: msg.content,
      ...(msg.images ? { images: msg.images } : {}),
    }))
  )([msgs]) as Message[];
};

const createUserMessage = (
  userInput: string | { type: string; data: string }[]
): Message => {
  return { role: "user", content: userInput };
};

const generateSystemPrompt = (
  prompt: string | undefined,
  botName: string | undefined,
  language: string,
  context: any
): string => {
  return generatePrompt(prompt || "", botName, language, context);
};

const determineModelType = (model: string): ModelType => {
  if (model.includes("o1-mini")) return ModelType.MinimalReasoning;
  if (model.includes("o1") || model.includes("o3")) return ModelType.Reasoning;
  return ModelType.Standard;
};

const determinePromptRole = (
  modelType: ModelType
): "system" | "develop" | null => {
  switch (modelType) {
    case ModelType.Standard:
      return "system";
    case ModelType.Reasoning:
      return "develop";
    case ModelType.MinimalReasoning:
      return null; // No prompt role for o1-mini
  }
};

const prependPromptMessage = (
  messages: Message[],
  promptContent: string,
  model: string
): Message[] => {
  const modelType = determineModelType(model);
  const promptRole = determinePromptRole(modelType);

  if (!promptRole) {
    return messages; // No prompt for MinimalReasoning (o1-mini)
  }

  return [{ role: promptRole, content: promptContent }, ...messages];
};

const buildRequestBody = (
  model: string,
  messages: Message[],
  providerName: string
): any => {
  const bodyData = {
    model,
    messages,
    stream: true,
  };

  if (providerName === "google" || providerName === "openrouter") {
    bodyData.stream_options = { include_usage: true };
  }

  return bodyData;
};

export const generateOpenAIRequestBody = (
  state: NoloRootState,
  userInput: string | { type: string; data: string }[],
  cybotConfig: CybotConfig,
  providerName: string,
  context: any = ""
) => {
  const previousMessages = filterValidMessages(state.message.msgs);
  const newUserMessage = createUserMessage(userInput);
  const conversationMessages = [...previousMessages, newUserMessage];

  const promptContent = generateSystemPrompt(
    cybotConfig.prompt,
    cybotConfig.name,
    navigator.language,
    context
  );
  console.log("Generated promptContent with context:", promptContent);

  const messagesWithPrompt = prependPromptMessage(
    conversationMessages,
    promptContent,
    cybotConfig.model
  );

  const requestBody = buildRequestBody(
    cybotConfig.model,
    messagesWithPrompt,
    providerName
  );

  console.log("Final OpenAI requestBody:", requestBody);
  return requestBody;
};
