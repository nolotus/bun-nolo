import { z } from "zod";

// 定义模型参数的常量默认值
export const DEFAULT_TEMPERATURE = 1.0;
export const DEFAULT_TOP_P = 1.0;
export const DEFAULT_FREQUENCY_PENALTY = 0.0;
export const DEFAULT_PRESENCE_PENALTY = 0.0;
export const DEFAULT_MAX_TOKENS = 4096; // 调大 max_tokens 的默认值

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
          type: z.string(), // 例如 "PAGE"
          dbKey: z.string(), // 页面标识符
          title: z.string(), // 页面标题
        })
      )
      .optional()
      .default([]), // 添加 references 字段，默认为空数组
    smartReadEnabled: z.boolean().default(false), // 新增 smartReadEnabled 字段，默认为 false
    // 模型参数字段，使用常量作为默认值
    temperature: z
      .number()
      .min(0, "Temperature must be at least 0")
      .max(2, "Temperature must be at most 2")
      .default(DEFAULT_TEMPERATURE),
    top_p: z
      .number()
      .min(0, "Top P must be at least 0")
      .max(1, "Top P must be at most 1")
      .default(DEFAULT_TOP_P),
    frequency_penalty: z
      .number()
      .min(-2, "Frequency Penalty must be at least -2")
      .max(2, "Frequency Penalty must be at most 2")
      .default(DEFAULT_FREQUENCY_PENALTY),
    presence_penalty: z
      .number()
      .min(-2, "Presence Penalty must be at least -2")
      .max(2, "Presence Penalty must be at most 2")
      .default(DEFAULT_PRESENCE_PENALTY),
    max_tokens: z
      .number()
      .min(1, "Max Tokens must be at least 1")
      .default(DEFAULT_MAX_TOKENS),
  })
  // 在 createCybotSchema 中修改 refine 逻辑
  .refine(
    (data) => {
      // 不需要 API Key 的情况：
      // 1. 使用 server proxy
      // 2. provider 是 ollama
      // 3. provider 是 custom
      if (
        data.useServerProxy ||
        data.provider.toLowerCase() === "ollama" ||
        data.provider.toLowerCase() === "custom"
      ) {
        return true;
      }
      // 其他情况需要 API Key
      return !!data.apiKey;
    },
    {
      message:
        "API Key is required unless using Server Proxy, Ollama or Custom provider",
      path: ["apiKey"],
    }
  );

export type FormData = z.infer<typeof createCybotSchema>;
