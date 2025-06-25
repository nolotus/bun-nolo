import { ReferenceItem } from "app/types";
import { z } from "zod";

// 定义模型参数的常量默认值（保留常量以备其他地方可能需要）
export const DEFAULT_TEMPERATURE = 1.0;
export const DEFAULT_TOP_P = 1.0;
export const DEFAULT_FREQUENCY_PENALTY = 0.0;
export const DEFAULT_PRESENCE_PENALTY = 0.0;
export const DEFAULT_MAX_TOKENS = 8192;
export const DEFAULT_REASONING_EFFORT = "medium";

// 定义 reasoning_effort 的可选值
export const REASONING_EFFORT_OPTIONS = ["low", "medium", "high"] as const;

// 👇 --- 兼容性处理：定义旧版本的 reference 类型 --- 👇
const legacyReferenceItemSchema = z.object({
  dbKey: z.string(),
  title: z.string(),
  type: z.enum(["page"]), // 旧版本只有 "page" 类型
});

// 👇 --- 新版本的 reference schema --- 👇
const newReferenceItemSchema = z.object({
  dbKey: z.string(),
  title: z.string(),
  type: z.enum(["knowledge", "instruction"]), // 新版本的类型
});

// 👇 --- 组合 schema，支持新旧格式 --- 👇
const referenceItemSchema = z
  .union([legacyReferenceItemSchema, newReferenceItemSchema])
  .transform((data) => {
    // 自动转换：将旧的 "page" 类型转换为 "knowledge"
    if (data.type === "page") {
      return {
        ...data,
        type: "knowledge" as const,
      };
    }
    return data;
  });

// 👇 --- 或者更简洁的方式：直接在 enum 中包含旧类型并转换 --- 👇
// const referenceItemSchema = z.object({
//   dbKey: z.string(),
//   title: z.string(),
//   type: z.enum(["knowledge", "instruction", "page"]) // 临时允许旧类型
// }).transform((data) => ({
//   ...data,
//   type: data.type === "page" ? "knowledge" : data.type
// }));

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
    inputPrice: z.number().min(0, "Input price must be at least 0").default(0),
    outputPrice: z
      .number()
      .min(0, "Output price must be at least 0")
      .default(0),
    tags: z.string().trim().optional().or(z.string().length(0)),

    // 👇 --- 使用兼容的 referenceItemSchema --- 👇
    references: z
      .array(referenceItemSchema)
      .optional()
      .default([])
      .refine(
        (refs) => {
          // 可以添加额外的验证逻辑，比如检查重复的 dbKey
          const dbKeys = refs?.map((ref) => ref.dbKey) || [];
          const uniqueDbKeys = new Set(dbKeys);
          return dbKeys.length === uniqueDbKeys.size;
        },
        {
          message: "Duplicate references are not allowed",
        }
      ),

    smartReadEnabled: z.boolean().default(false),

    // 👇 --- 模型参数字段，增强错误信息 --- 👇
    temperature: z
      .number()
      .min(0, "Temperature must be between 0 and 2")
      .max(2, "Temperature must be between 0 and 2")
      .optional(),
    top_p: z
      .number()
      .min(0, "Top P must be between 0 and 1")
      .max(1, "Top P must be between 0 and 1")
      .optional(),
    frequency_penalty: z
      .number()
      .min(-2, "Frequency Penalty must be between -2 and 2")
      .max(2, "Frequency Penalty must be between -2 and 2")
      .optional(),
    presence_penalty: z
      .number()
      .min(-2, "Presence Penalty must be between -2 and 2")
      .max(2, "Presence Penalty must be between -2 and 2")
      .optional(),
    max_tokens: z
      .number()
      .min(1, "Max Tokens must be at least 1")
      .max(500000, "Max Tokens must be at most 500,000")
      .optional(),
    reasoning_effort: z
      .enum(REASONING_EFFORT_OPTIONS, {
        errorMap: () => ({
          message: "Reasoning effort must be low, medium, or high",
        }),
      })
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
        "API Key is required when not using Server Proxy, Ollama or Custom provider",
      path: ["apiKey"],
    }
  )
  // 👇 --- 添加额外的全局验证 --- 👇
  .refine(
    (data) => {
      // 如果设置了自定义 URL，确保它不为空
      if (data.provider.toLowerCase() === "custom" && !data.customProviderUrl) {
        return false;
      }
      return true;
    },
    {
      message: "Custom Provider URL is required when using custom provider",
      path: ["customProviderUrl"],
    }
  );

export type FormData = z.infer<typeof createCybotSchema>;

// 👇 --- 帮助函数：手动规范化 references（用于非表单场景） --- 👇
export const normalizeReferences = (references: any[]): ReferenceItem[] => {
  if (!Array.isArray(references)) return [];

  return references.map((ref) => ({
    dbKey: ref.dbKey || "",
    title: ref.title || "",
    type: ref.type === "page" ? "knowledge" : ref.type || "knowledge",
  }));
};

// 👇 --- 帮助函数：验证单个 reference --- 👇
export const validateReference = (ref: any): ref is ReferenceItem => {
  return (
    typeof ref === "object" &&
    ref !== null &&
    typeof ref.dbKey === "string" &&
    typeof ref.title === "string" &&
    (ref.type === "knowledge" ||
      ref.type === "instruction" ||
      ref.type === "page")
  );
};
