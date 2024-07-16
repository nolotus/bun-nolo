import { InputMessage, OutputMessage } from "ai/messages/type";
import { ClaudeMessageSchema, ClaudeContent } from "./type";

export const claudeHandler = {
  extractBase64FromDataUrl: (url: string): string =>
    url.startsWith("data:") ? url.split(",")[1] : url,

  getMediaType: (url: string): string =>
    url.split(";")[0].split(":")[1] || "image/jpeg",

  transformSingleMessage: (input: InputMessage): OutputMessage => {
    const content: ClaudeContent = Array.isArray(input.content)
      ? input.content.map((item) =>
          item.type === "text"
            ? { type: "text", text: item.text }
            : {
                type: "image",
                source: {
                  type: "base64",
                  media_type: claudeHandler.getMediaType(item.image_url!.url),
                  data: claudeHandler.extractBase64FromDataUrl(
                    item.image_url!.url,
                  ),
                },
              },
        )
      : [{ type: "text", text: input.content }];

    return {
      role: input.role,
      content,
    };
  },

  processPrompt: (promptMessage: InputMessage): OutputMessage =>
    claudeHandler.transformSingleMessage(promptMessage),

  processPrevMessages: (prevMsgs: InputMessage[]): OutputMessage[] =>
    prevMsgs.map(claudeHandler.transformSingleMessage),

  processCurrentInput: (
    content: string | InputMessage["content"],
  ): OutputMessage =>
    claudeHandler.transformSingleMessage({ role: "user", content }),

  prepareMsgs: ({ promotMessage, prevMsgs, content }): OutputMessage[] => {
    const processedMessages = [
      claudeHandler.processPrompt(promotMessage),
      ...claudeHandler.processPrevMessages(prevMsgs),
      claudeHandler.processCurrentInput(content),
    ];

    processedMessages.forEach((message, index) => {
      try {
        ClaudeMessageSchema.parse(message);
      } catch (error) {
        console.error(`Message at index ${index} is invalid:`, error.errors);
        throw new Error(
          `Message at index ${index} is invalid: ${error.errors}`,
        );
      }
    });

    return processedMessages;
  },
};
