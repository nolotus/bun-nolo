// integrations/deepinfra/models.ts
import { Model } from "ai/llm/types";

export const deepinfraModels: Model[] = [
  {
    // OpenAI GPT‑OSS 120B – 原价 $0.09 / $0.45 per M token，已统一乘以 10
    name: "openai/gpt-oss-120b",
    displayName: "OpenAI GPT‑OSS 120B",
    hasVision: false,
    price: { input: 0.09 * 10, output: 0.45 * 10 }, // $0.90 / $4.50 per M token
    maxOutputTokens: 8192,
    contextWindow: 131072,
  },

  {
    // Moonshot AI – Kimi‑K2‑Instruct（价格已乘以 10）
    name: "moonshotai/Kimi-K2-Instruct",
    displayName: "Kimi K2 Instruct",
    hasVision: false,
    // 原价 $0.50 / $2.00 per M token，乘以 10 后
    price: { input: 0.5 * 10, output: 2.0 * 10 }, // $5.00 / $20.00 per M token
    maxOutputTokens: 8192,
    contextWindow: 131072,
  },

  {
    // Qwen – 3‑235B‑A22B‑Thinking‑2507（价格已乘以 10）
    name: "Qwen/Qwen3-235B-A22B-Thinking-2507",
    displayName: "Qwen3‑235B‑A22B‑Thinking‑2507",
    hasVision: false,
    // 原价 $0.13 / $0.60 per M token，乘以 10 后
    price: { input: 0.13 * 10, output: 0.6 * 10 }, // $1.30 / $6.00 per M token
    maxOutputTokens: 8192,
    contextWindow: 262144,
  },

  {
    // Qwen – 3‑235B‑A22B‑Instruct‑2507（非‑thinking 版，价格已乘以 10）
    name: "Qwen/Qwen3-235B-A22B-Instruct-2507",
    displayName: "Qwen3‑235B‑A22B‑Instruct‑2507",
    hasVision: false,
    // 原价 $0.13 / $0.60 per M token，乘以 10 后
    price: { input: 0.13 * 10, output: 0.6 * 10 }, // $1.30 / $6.00 per M token
    maxOutputTokens: 8192,
    contextWindow: 262144,
  },

  {
    // Qwen – 3‑Coder‑480B‑A35B‑Instruct（价格已乘以 10）
    name: "Qwen/Qwen3-Coder-480B-A35B-Instruct",
    displayName: "Qwen3‑Coder‑480B‑A35B‑Instruct",
    hasVision: false,
    // 原价 $0.40 / $1.60 per M token，乘以 10 后
    price: { input: 0.4 * 10, output: 1.6 * 10 }, // $4.00 / $16.00 per M token
    maxOutputTokens: 8192,
    contextWindow: 262144,
  },

  {
    // Google Gemini 2.5 Pro – 价格已乘以 10（每 M token）
    name: "google/gemini-2.5-pro",
    displayName: "Gemini 2.5 Pro",
    hasVision: false,
    // 原价 $0.875 / $7.00 per M token，乘以 10 后
    price: { input: 0.875 * 10, output: 7.0 * 10 }, // $8.75 / $70.00 per M token
    maxOutputTokens: 8192, // 若官方给出更大上限，可自行替换
    contextWindow: 1_000_000, // 1 M 上下文窗口
  },

  {
    // Qwen – Qwen3-Next-80B-A3B-Instruct（价格已乘以 10）
    name: "Qwen/Qwen3-Next-80B-A3B-Instruct",
    displayName: "Qwen3-Next-80B-A3B-Instruct",
    hasVision: false,
    // 原价 $0.14 / $1.40 per M token，乘以 10 后 → $1.40 / $14.00 per M token
    price: { input: 0.14 * 10, output: 1.4 * 10 }, // $1.40 / $14.00 per M token
    maxOutputTokens: 8192,
    contextWindow: 131072, // 假设与多数 Qwen3 模型一致，如无官方数据可调整
  },

  {
    // DeepSeek V3.1 Terminus – 价格已乘以 10（每 M token）
    name: "deepseek-ai/DeepSeek-V3.1-Terminus",
    displayName: "DeepSeek V3.1 Terminus",
    hasVision: false,
    // 原价 $0.216 (cached input) / $0.27 (input) / $1.00 (output) per M token，乘以 10 后（使用 normal input）
    price: { input: 0.27 * 10, output: 1.0 * 10 }, // $2.70 / $10.00 per M token
    maxOutputTokens: 163840,
    contextWindow: 163840,
  },
  {
    // PaddlePaddle/PaddleOCR-VL-0.9B – 价格已乘以 10（每 M token）
    name: "PaddlePaddle/PaddleOCR-VL-0.9B",
    displayName: "PaddlePaddle/PaddleOCR-VL-0.9B",
    hasVision: true, // OCR 模型通常支持视觉能力
    price: { input: 0.14 * 10, output: 0.8 * 10 }, // $1.40 / $8.00 per M token
    maxOutputTokens: 8192, // 默认值，可根据实际情况调整
    contextWindow: 131072, // 默认值，可根据实际情况调整
  },
];
