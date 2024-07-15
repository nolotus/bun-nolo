import { z } from "zod";

// 类型定义
interface InputMessage {
  content:
    | Array<{
        text?: string;
        type: string;
        image_url?: {
          url: string;
        };
      }>
    | string;
  role: string;
}

interface OutputMessage {
  role: string;
  content: string;
  images: string[];
}

// Zod schema 定义
const LlavaMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
  images: z.array(z.string()).optional(),
});

// 辅助函数
function extractBase64FromDataUrl(url: string): string {
  return url.startsWith("data:") ? url.split(",")[1] : url;
}

// 辅助函数：转换单个消息
function transformSingleMessage(input: InputMessage): OutputMessage {
  console.log("transformSingleMessage input:", JSON.stringify(input, null, 2));

  let textContent = "";
  let imageUrls: string[] = [];

  if (typeof input.content === "string") {
    textContent = input.content;
  } else {
    textContent =
      input.content.find((item) => item.type === "text")?.text || "";
    imageUrls = input.content
      .filter((item) => item.type === "image_url")
      .map((item) => extractBase64FromDataUrl(item.image_url!.url));
  }

  const result: OutputMessage = {
    role: input.role,
    content: textContent,
  };

  if (imageUrls.length > 0) {
    result.images = imageUrls;
  }

  console.log(
    "transformSingleMessage output:",
    JSON.stringify(result, null, 2),
  );
  return result;
}
// 处理 prompt 消息
function processPrompt(promptMessage: InputMessage): OutputMessage {
  const result = transformSingleMessage(promptMessage);
  return result;
}

// 处理历史消息
function processPrevMessages(prevMsgs: InputMessage[]): OutputMessage[] {
  const results = prevMsgs.map(transformSingleMessage);
  console.log("Processed previous messages:", results);
  return results;
}

// 处理当前用户输入
function processCurrentInput(
  content: string | InputMessage["content"],
): OutputMessage {
  const inputMessage: InputMessage = { role: "user", content };
  const result = transformSingleMessage(inputMessage);
  console.log("Processed current input:", JSON.stringify(result, null, 2));
  return result;
}

// 主要处理函数
export function prepareMsgs({ model, promotMessage, prevMsgs, content }) {
  if (model === "llava") {
    const processedPrompt = processPrompt(promotMessage);
    const processedPrevMsgs = processPrevMessages(prevMsgs);
    const processedCurrentInput = processCurrentInput(content);

    const processedMessages = [
      processedPrompt,
      ...processedPrevMsgs,
      processedCurrentInput,
    ];

    // Zod 验证
    processedMessages.forEach((message, index) => {
      try {
        LlavaMessageSchema.parse(message);
      } catch (error) {
        console.error(`Message at index ${index} is invalid:`, error.errors);
        throw new Error(
          `Message at index ${index} is invalid: ${error.errors}`,
        );
      }
    });

    return processedMessages;
  }

  // 对于其他模型的处理逻辑
  return [promotMessage, ...prevMsgs, { role: "user", content }];
}
