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
  id?: string;
  role: string;
  content: string | { type: string; data: string }[];
  images?: any;
  userId?: string;
}

const filterValidMessages = (msgs: any[]): Message[] => {
  return pipe(
    flatten,
    filter((msg: Message | null) => {
      if (!msg) return false;
      // 如果 content 为数组，则拼接处理数组中的每一项
      let content = "";
      if (Array.isArray(msg.content)) {
        content = msg.content
          .map((item) => {
            switch (item.type) {
              case "text":
                return (item.text || item.data || "").trim();
              case "image_url":
                return item.image_url && item.image_url.url
                  ? `![图片](${item.image_url.url})`
                  : "";
              case "excel":
                if (Array.isArray(item.data) && item.data.length > 0) {
                  const keys = Object.keys(item.data[0]);
                  const header = keys.join("\t");
                  const rows = item.data.map((row: any) =>
                    keys.map((key) => row[key]).join("\t")
                  );
                  return `Excel 文件: ${item.name || "未知文件"}\n${header}\n${rows.join(
                    "\n"
                  )}`;
                } else {
                  return `Excel 文件: ${item.name || "未知文件"} (无数据)`;
                }
              default:
                return "";
            }
          })
          .join("\n");
      } else {
        content = msg.content;
      }
      return content.trim() !== "";
    }),
    reverse,
    map((msg: Message) => {
      // 将数组形式的内容转换为文本输出
      let content = "";
      if (Array.isArray(msg.content)) {
        content = msg.content
          .map((item) => {
            switch (item.type) {
              case "text":
                return (item.text || item.data || "").trim();
              case "image_url":
                return item.image_url && item.image_url.url
                  ? `![图片](${item.image_url.url})`
                  : "";
              case "excel":
                if (Array.isArray(item.data) && item.data.length > 0) {
                  const keys = Object.keys(item.data[0]);
                  const header = keys.join("\t");
                  const rows = item.data.map((row: any) =>
                    keys.map((key) => row[key]).join("\t")
                  );
                  return `Excel 文件: ${item.name || "未知文件"}\n${header}\n${rows.join(
                    "\n"
                  )}`;
                } else {
                  return `Excel 文件: ${item.name || "未知文件"} (无数据)`;
                }
              default:
                return "";
            }
          })
          .join("\n");
      } else {
        content = msg.content;
      }
      return {
        role: msg.role,
        content,
        ...(msg.images ? { images: msg.images } : {}),
      };
    })
  )(msgs) as Message[];
};

const createUserMessage = (
  userInput:
    | string
    | {
        type: string;
        text?: string;
        data?: any;
        image_url?: { url: string };
        name?: string;
      }[]
): Message => {
  let content = "";

  if (typeof userInput === "string") {
    content = userInput;
  } else if (Array.isArray(userInput)) {
    content = userInput
      .map((item) => {
        switch (item.type) {
          case "text":
            // 优先使用 text 字段，其次看 data 字段
            return (
              item.text?.trim() ||
              (typeof item.data === "string" ? item.data.trim() : "")
            );
          case "image_url":
            // 将图片链接转换为 Markdown 图片格式
            if (item.image_url && item.image_url.url) {
              return `![图片](${item.image_url.url})`;
            }
            return "";
          case "excel":
            // 处理 Excel 文件，将表格数据转换为纯文本
            if (Array.isArray(item.data) && item.data.length > 0) {
              const keys = Object.keys(item.data[0]);
              const header = keys.join("\t");
              const rows = item.data.map((row: any) =>
                keys.map((key) => row[key]).join("\t")
              );
              return `Excel 文件: ${item.name || "未知文件"}\n${header}\n${rows.join("\n")}`;
            } else {
              return `Excel 文件: ${item.name || "未知文件"} (无数据)`;
            }
          default:
            return "";
        }
      })
      .filter((part) => part.trim() !== "")
      .join("\n");
  }

  // 添加日志记录生成的用户消息内容
  console.log("生成的用户消息内容:", content);

  return { role: "user", content };
};

const generateSystemPrompt = (
  prompt: string | undefined,
  botName: string | undefined,
  language: string,
  context: any
): string => {
  return generatePrompt(prompt || "", botName, language, context);
};

const prependPromptMessage = (
  messages: Message[],
  promptContent: string
): Message[] => {
  return [{ role: "system", content: promptContent }, ...messages];
};

const buildRequestBody = (
  model: string,
  messages: Message[],
  providerName: string
): any => {
  const bodyData: any = {
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
    promptContent
  );

  const requestBody = buildRequestBody(
    cybotConfig.model,
    messagesWithPrompt,
    providerName
  );

  console.log("Final OpenAI requestBody:", requestBody);
  return requestBody;
};
