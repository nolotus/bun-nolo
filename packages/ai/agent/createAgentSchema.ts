// 路径: app/features/ai/common/createAgentSchema.ts (替换后的完整文件)

import { ReferenceItem } from "app/types"; // 确保 app/types 里有 ReferenceItem 定义
import { TFunction } from "i18next";
import { z } from "zod";

// --- 所有常量和辅助 schema 保持不变 ---
export const DEFAULT_TEMPERATURE = 1.0;
export const DEFAULT_TOP_P = 1.0;
export const DEFAULT_FREQUENCY_PENALTY = 0.0;
export const DEFAULT_PRESENCE_PENALTY = 0.0;
export const DEFAULT_MAX_TOKENS = 1024;
export const DEFAULT_REASONING_EFFORT = "medium";

export const REASONING_EFFORT_OPTIONS = ["low", "medium", "high"] as const;

const referenceItemSchema = z
  .object({
    dbKey: z.string(),
    title: z.string(),
    type: z.enum(["knowledge", "instruction", "page"]),
  })
  .transform((data) => ({
    ...data,
    type: data.type === "page" ? "knowledge" : data.type,
  }));

// --- 核心修改在这里 ---
export const getCreateAgentSchema = (t: TFunction) =>
  z
    .object({
      // --- 所有现有字段的校验保持完全不变 ---
      name: z
        .string()
        .trim()
        .min(1, t("validation.nameRequired"))
        .max(50, t("validation.nameTooLong")),
      provider: z.string().trim().min(1, t("validation.providerRequired")),
      model: z.string().trim().min(1, t("validation.modelRequired")),
      customProviderUrl: z
        .string()
        .trim()
        .optional()
        .or(z.string().length(0))
        .refine((val) => !val || z.string().url().safeParse(val).success, {
          message: t("validation.invalidUrl"),
        }),
      apiKey: z.string().trim().optional().or(z.string().length(0)),
      useServerProxy: z.boolean().default(true),
      prompt: z.string().trim().optional().or(z.string().length(0)),
      tools: z.array(z.string()).default([]),
      isPublic: z.boolean().default(false), // isPublic 字段保持不变
      greeting: z.string().trim().optional().or(z.string().length(0)),
      introduction: z.string().trim().optional().or(z.string().length(0)),
      inputPrice: z.number().min(0, t("validation.priceMin")).default(0),
      outputPrice: z.number().min(0, t("validation.priceMin")).default(0),
      tags: z.string().trim().optional().or(z.string().length(0)),
      references: z
        .array(referenceItemSchema)
        .optional()
        .default([])
        .refine(
          (refs) => {
            const dbKeys = refs?.map((ref) => ref.dbKey) || [];
            return dbKeys.length === new Set(dbKeys).size;
          },
          { message: t("validation.duplicateReferences") }
        ),
      smartReadEnabled: z.boolean().default(false),
      temperature: z
        .number()
        .min(0, t("validation.temperatureRange"))
        .max(2, t("validation.temperatureRange"))
        .optional(),
      top_p: z
        .number()
        .min(0, t("validation.topPRange"))
        .max(1, t("validation.topPRange"))
        .optional(),
      frequency_penalty: z
        .number()
        .min(-2, t("validation.frequencyPenaltyRange"))
        .max(2, t("validation.frequencyPenaltyRange"))
        .optional(),
      presence_penalty: z
        .number()
        .min(-2, t("validation.presencePenaltyRange"))
        .max(2, t("validation.presencePenaltyRange"))
        .optional(),
      max_tokens: z
        .number()
        .min(1, t("validation.maxTokensMin"))
        .max(500000, t("validation.maxTokensMax"))
        .optional(),
      reasoning_effort: z
        .enum(REASONING_EFFORT_OPTIONS, {
          errorMap: () => ({ message: t("validation.reasoningEffortInvalid") }),
        })
        .default(DEFAULT_REASONING_EFFORT)
        .optional(),

      /**
       * [战术热修新增] 增加 whitelist 字段的校验。
       * 这是一个可选的 (optional)、由非空字符串组成的数组 (array of non-empty strings)。
       * 使用 .default([]) 确保即使表单中没有这个字段，它也会被视为空数组，而不是 undefined。
       */
      whitelist: z.array(z.string().trim().min(1)).optional().default([]),
    })
    // --- 所有 .refine 的逻辑保持完全不变 ---
    .refine(
      (data) => {
        const providerLower = data.provider.toLowerCase();
        if (
          data.useServerProxy ||
          providerLower === "ollama" ||
          providerLower === "custom"
        ) {
          return true;
        }
        return !!data.apiKey;
      },
      {
        message: t("validation.apiKeyRequired"),
        path: ["apiKey"],
      }
    )
    .refine(
      (data) => {
        if (data.provider.toLowerCase() === "custom") {
          return !!data.customProviderUrl;
        }
        return true;
      },
      {
        message: t("validation.customUrlRequired"),
        path: ["customProviderUrl"],
      }
    );

// FormData 类型推断会自动包含新的 whitelist 字段，无需手动修改
export type FormData = z.infer<ReturnType<typeof getCreateAgentSchema>>;

// normalizeReferences 函数保持不变
export const normalizeReferences = (references: any[]): ReferenceItem[] => {
  if (!Array.isArray(references)) return [];
  return references.map((ref) => ({
    dbKey: ref.dbKey || "",
    title: ref.title || "",
    type: ref.type === "page" ? "knowledge" : ref.type || "knowledge",
  }));
};
