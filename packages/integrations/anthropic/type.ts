import { z } from "zod";

// Claude 特定的类型定义
export type ClaudeContent = Array<
  | {
      type: "text";
      text: string;
    }
  | {
      type: "image";
      source: {
        type: "base64";
        media_type: string;
        data: string;
      };
    }
>;

// Zod  定义
export const ClaudeMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.union([
    z.string(),
    z.array(
      z.union([
        z.object({
          type: z.literal("text"),
          text: z.string(),
        }),
        z.object({
          type: z.literal("image"),
          source: z.object({
            type: z.literal("base64"),
            media_type: z.string(),
            data: z.string(),
          }),
        }),
      ]),
    ),
  ]),
});
