// ai/llm/providers.ts
import { anthropicModels } from "integrations/anthropic/anthropicModels";
import { deepinfraModels } from "integrations/deepinfra/models";
import { deepSeekModels } from "integrations/deepseek/models";
import { fireworksmodels } from "integrations/fireworks/models";
import { googleModels } from "integrations/google/models";
import { mistralModels } from "integrations/mistral/models";
import { openAIModels } from "integrations/openai/models";
import { ollamaModels } from "integrations/ollama/models";
import { sambanovaModels } from "integrations/sambanova/models";
import { openrouterModels } from "integrations/openrouter/models";
import { xaiModels } from "integrations/xai/models";

import type { Model } from "./types";
import type { Agent } from "app/types";

/* ──────────────────────────────────────────
 * 所有模型（仅用于功能过滤）
 * ────────────────────────────────────────── */
const allModels: Model[] = [
  ...anthropicModels,
  ...deepinfraModels,
  ...deepSeekModels,
  ...fireworksmodels,
  ...googleModels,
  ...mistralModels,
  ...openAIModels,
  ...ollamaModels,
  ...sambanovaModels,
  ...openrouterModels,
  ...xaiModels,
];

export const supportedReasoningModels = allModels
  .filter((m) => m.supportsReasoningEffort)
  .map((m) => m.name);

/* ──────────────────────────────────────────
 * Provider → 模型列表
 * ────────────────────────────────────────── */
const MODEL_MAP = {
  anthropic: anthropicModels,
  ollama: ollamaModels,
  fireworks: fireworksmodels,
  deepinfra: deepinfraModels,
  deepseek: deepSeekModels,
  mistral: mistralModels,
  google: googleModels,
  sambanova: sambanovaModels,
  openai: openAIModels,
  openrouter: openrouterModels,
  xai: xaiModels,
} as const;

/* 自动推断 Provider 字面量类型 */
export const availableProviderOptions = Object.keys(MODEL_MAP) as Array<
  keyof typeof MODEL_MAP
>;
export type Provider = (typeof availableProviderOptions)[number];

/* ──────────────────────────────────────────
 * Provider → 命名端点
 * 统一用 endpointKey 提高可读性
 * ────────────────────────────────────────── */
type ProviderEndpointMap = Record<string, string>; // endpointKey → URL

const API_ENDPOINTS: Record<string, ProviderEndpointMap> = {
  openai: {
    completions: "https://api.openai.com/v1/chat/completions",
    responses: "https://api.openai.com/v1/responses",
  },
  deepinfra: {
    default: "https://api.deepinfra.com/v1/openai/chat/completions",
  },
  fireworks: {
    default: "https://api.fireworks.ai/inference/v1/chat/completions",
  },
  xai: {
    default: "https://api.x.ai/v1/chat/completions",
  },
  deepseek: {
    default: "https://api.deepseek.com/chat/completions",
  },
  mistral: {
    default: "https://api.mistral.ai/v1/chat/completions",
  },
  google: {
    default:
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
  },
  ollama: {
    default: "http://localhost:11434/v1/chat/completions",
  },
  sambanova: {
    default: "https://api.sambanova.ai/v1/chat/completions",
  },
  openrouter: {
    default: "https://openrouter.ai/api/v1/chat/completions",
  },
} as const;

/* ──────────────────────────────────────────
 * 工具函数
 * ────────────────────────────────────────── */

/** 根据 provider & name 获取模型配置 */
export function getModelConfig(provider: Provider, name: string): Model {
  const list = MODEL_MAP[provider];
  if (!list) throw new Error(`Provider ${provider} not supported`);
  const model = list.find((m) => m.name === name);
  if (!model)
    throw new Error(`Model ${name} not found for provider ${provider}`);
  return model;
}

/** 获取某 provider 全量模型 */
export function getModelsByProvider(provider: Provider): Model[] {
  return MODEL_MAP[provider] ?? [];
}

/** 统一获取 ChatCompletion / Responses 等端点 */
export function getApiEndpoint(agent: Agent): string {
  const { provider, customProviderUrl, endpointKey, model } = agent;

  /* 手动覆盖 */
  if (customProviderUrl) return customProviderUrl;

  /* custom provider 但未给 URL 的兜底 */
  if (provider.toLowerCase() === "custom") {
    throw new Error(
      "Custom provider URL is required when provider is 'custom'."
    );
  }

  /* Provider 端点表 */
  const endpoints = API_ENDPOINTS[provider];
  if (!endpoints) throw new Error(`Unsupported provider: ${provider}`);

  /* 1. Agent 显式 endpointKey 优先 */
  let key = endpointKey;

  /* 2. 未指定时，读取模型默认 endpointKey */
  if (!key && model) {
    try {
      key = getModelConfig(provider as Provider, model).endpointKey;
    } catch {
      /* ignore */
    }
  }

  /* 3. 取 URL 顺序：指定 key → default → 第一个 */
  if (key && endpoints[key]) return endpoints[key];
  if (endpoints.default) return endpoints.default;

  const first = Object.values(endpoints)[0];
  if (first) return first;

  throw new Error(`No endpoint found for provider ${provider}`);
}
