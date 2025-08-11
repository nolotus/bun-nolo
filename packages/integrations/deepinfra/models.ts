// integrations/deepinfra/models.ts
import { Model } from "ai/llm/types";

export const deepinfraModels: Model[] = [
  {
    // DeepSeek R1 – 价格已改为乘以 10（每 M token）
    name: "deepseek-ai/DeepSeek-R1-0528",
    displayName: "DeepSeek R1 0528",
    hasVision: false,
    // 输入 $0.5 / M token，输出 $2.18 * 10 / M token
    price: { input: 0.5, output: 2.18 * 10 },
    maxOutputTokens: 163840,
    contextWindow: 131072, // 统一的 131,072 上下文窗口
    supportsReasoningEffort: true,
  },
  {
    // DeepSeek V3 – 价格同样改为乘以 10（每 M token）
    name: "deepseek-ai/DeepSeek-V3-0324",
    displayName: "DeepSeek V3 0324",
    hasVision: false,
    // 输入 $0.3 * 10 / M token，输出 $0.88 * 10 / M token
    price: { input: 0.3 * 10, output: 0.88 * 10 },
    maxOutputTokens: 163880,
    contextWindow: 131072,
  },

  {
    // OpenAI GPT‑OSS 120B – 原价 $0.09 / $0.45 per M token，已统一乘以 10
    name: "openai/gpt-oss-120b",
    displayName: "OpenAI GPT‑OSS 120B",
    hasVision: false,
    price: { input: 0.09 * 10, output: 0.45 * 10 }, // $0.90 / $4.50 per M token
    maxOutputTokens: 8192, // 示例值，实际可替换为官方上限
    contextWindow: 131072, // 统一的 131,072 上下文窗口
  },
];
