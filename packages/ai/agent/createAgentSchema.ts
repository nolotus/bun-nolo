// 路径: app/features/ai/common/createAgentSchema.ts

import { ReferenceItem } from "app/types"; // 确保 app/types 里有 ReferenceItem 定义
import { TFunction } from "i18next";
import { z } from "zod";

// --- 常量 ---
export const DEFAULT_TEMPERATURE = 0.7;
export const DEFAULT_TOP_P = 0.95;
export const DEFAULT_FREQUENCY_PENALTY = 0.0;
export const DEFAULT_PRESENCE_PENALTY = 0.0;
export const DEFAULT_MAX_TOKENS = 4096;
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

// --- 核心 schema ---
export const getCreateAgentSchema = (t: TFunction) =>
  z
    .object({
      name: z
        .string()
        .trim()
        .min(1, t("validation.nameRequired"))
        .max(50, t("validation.nameTooLong")),

      /**
       * provider 不再必填：只是一个可选的标识字段
       */
      provider: z.string().trim().optional().or(z.string().length(0)),

      /**
       * 模型：
       * - 非自定义 API 时必须选择（通过 refine 条件校验）
       * - 自定义 API 时可以不选，只填 customModelName
       */
      model: z.string().trim().optional().or(z.string().length(0)),

      /**
       * API 来源：平台 / 自定义
       */
      apiSource: z.enum(["platform", "custom"]).default("platform"),

      /**
       * 自定义模型名（可选，允许空字符串）
       * 只在 apiSource === "custom" 时才展示 & 才有意义
       */
      customModelName: z.string().trim().optional().or(z.string().length(0)),

      customProviderUrl: z
        .string()
        .trim()
        .optional()
        .or(z.string().length(0))
        .refine((val) => !val || z.string().url().safeParse(val).success, {
          message: t("validation.invalidUrl"),
        }),

      /**
       * API Key：完全可选（本地 / 无鉴权的自定义接口不需要）
       */
      apiKey: z.string().trim().optional().or(z.string().length(0)),

      useServerProxy: z.boolean().default(true),

      prompt: z.string().trim().optional().or(z.string().length(0)),

      tools: z.array(z.string()).default([]),

      isPublic: z.boolean().default(false),

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
       * whitelist：白名单
       */
      whitelist: z.array(z.string().trim().min(1)).optional().default([]),
    })
    // --- refine 逻辑 ---
    // 1) 自定义 URL 必填：
    //    - 只要 apiSource === "custom"，必须填写 customProviderUrl
    .refine(
      (data) => {
        if (data.apiSource === "custom") {
          return !!data.customProviderUrl;
        }
        return true;
      },
      {
        message: t("validation.customUrlRequired"),
        path: ["customProviderUrl"],
      }
    )
    // 2) 模型必填规则：
    //    - 非自定义 API：model 必填
    //    - 自定义 API：model 和 customModelName 至少填一个
    .refine(
      (data) => {
        const isCustomApi = data.apiSource === "custom";

        // 普通平台/托管：model 必须有值
        if (!isCustomApi) {
          return !!data.model?.trim();
        }

        // 自定义 API：model / customModelName 至少一个有值
        const hasModel = !!data.model?.trim();
        const hasCustomModelName = !!data.customModelName?.trim();

        return hasModel || hasCustomModelName;
      },
      {
        message: t("validation.modelOrCustomModelNameRequired"),
        path: ["model"],
      }
    );

export type FormData = z.infer<ReturnType<typeof getCreateAgentSchema>>;

export const normalizeReferences = (references: any[]): ReferenceItem[] => {
  if (!Array.isArray(references)) return [];
  return references.map((ref) => ({
    dbKey: ref.dbKey || "",
    title: ref.title || "",
    type: ref.type === "page" ? "knowledge" : ref.type || "knowledge",
  }));
};
