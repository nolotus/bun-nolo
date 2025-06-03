import { z } from "zod";

// 定义模型参数的常量默认值（保留常量以备其他地方可能需要）
export const DEFAULT_TEMPERATURE = 1.0;
export const DEFAULT_TOP_P = 1.0;
export const DEFAULT_FREQUENCY_PENALTY = 0.0;
export const DEFAULT_PRESENCE_PENALTY = 0.0;
export const DEFAULT_MAX_TOKENS = 8192;
export const DEFAULT_REASONING_EFFORT = "medium"; // 新增默认值

// 定义 reasoning_effort 的可选值
export const REASONING_EFFORT_OPTIONS = ["low", "medium", "high"] as const;

export const createCybotSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(50, "Name is too long"),
    provider: z.string().trim().min(1, "Provider is required"),
    model: z.string().trim().min(1, "Model is required"),
    customProviderUrl: z
      .string()
      .trim()
      .optional()
      .or(z.string().length(0))
      .refine(
        (val) => {
          if (val && val.length > 0) {
            return z.string().url().safeParse(val).success;
          }
          return true;
        },
        { message: "Must be a valid URL when provided" }
      ),
    apiKey: z.string().trim().optional().or(z.string().length(0)),
    useServerProxy: z.boolean().default(true),
    prompt: z.string().trim().optional().or(z.string().length(0)),
    tools: z.array(z.string()).default([]),
    isPublic: z.boolean().default(false),
    greeting: z.string().trim().optional().or(z.string().length(0)),
    introduction: z.string().trim().optional().or(z.string().length(0)),
    inputPrice: z.number().min(0).default(0),
    outputPrice: z.number().min(0).default(0),
    tags: z.string().trim().optional().or(z.string().length(0)),
    references: z
      .array(
        z.object({
          type: z.string(),
          dbKey: z.string(),
          title: z.string(),
        })
      )
      .optional()
      .default([]),
    smartReadEnabled: z.boolean().default(false),
    // 模型参数字段，设置为可选
    temperature: z
      .number()
      .min(0, "Temperature must be at least 0")
      .max(2, "Temperature must be at most 2")
      .optional(),
    top_p: z
      .number()
      .min(0, "Top P must be at least 0")
      .max(1, "Top P must be at most 1")
      .optional(),
    frequency_penalty: z
      .number()
      .min(-2, "Frequency Penalty must be at least -2")
      .max(2, "Frequency Penalty must be at most 2")
      .optional(),
    presence_penalty: z
      .number()
      .min(-2, "Presence Penalty must be at least -2")
      .max(2, "Presence Penalty must be at most 2")
      .optional(),
    max_tokens: z.number().min(1, "Max Tokens must be at least 1").optional(),
    // 新增 reasoning_effort 字段
    reasoning_effort: z
      .enum(REASONING_EFFORT_OPTIONS)
      .default(DEFAULT_REASONING_EFFORT)
      .optional(),
  })
  .refine(
    (data) => {
      if (
        data.useServerProxy ||
        data.provider.toLowerCase() === "ollama" ||
        data.provider.toLowerCase() === "custom"
      ) {
        return true;
      }
      return !!data.apiKey;
    },
    {
      message:
        "API Key is required unless using Server Proxy, Ollama or Custom provider",
      path: ["apiKey"],
    }
  );

export type FormData = z.infer<typeof createCybotSchema>;
