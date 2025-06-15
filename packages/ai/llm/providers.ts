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

import { sendClaudeRequest } from "ai/chat/sendClaudeRequest";
import { sendCommonChatRequest } from "ai/chat/sendCommonRequest";
import type { Model } from "./types";

interface CybotConfig {
  provider: string;
  customProviderUrl?: string;
}

// 提取所有支持推理功能的模型
const allModels = [
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
  .filter((model) => model.supportsReasoningEffort)
  .map((model) => model.name);

// 1. 各 provider 对应的模型列表
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

// 2. 各 provider 对应的 Chat Completion URL
const API_ENDPOINTS: Record<string, string> = {
  openai: "https://api.openai.com/v1/chat/completions",
  deepinfra: "https://api.deepinfra.com/v1/openai/chat/completions",
  fireworks: "https://api.fireworks.ai/inference/v1/chat/completions",
  xai: "https://api.x.ai/v1/chat/completions",
  deepseek: "https://api.deepseek.com/chat/completions",
  mistral: "https://api.mistral.ai/v1/chat/completions",
  google:
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
  ollama: "http://localhost:11434/v1/chat/completions",
  sambanova: "https://api.sambanova.ai/v1/chat/completions",
  openrouter: "https://openrouter.ai/api/v1/chat/completions",
};

// 3. 请求处理器，默认 sendCommon，anthropic 用 sendClaude
const DEFAULT_HANDLER = sendCommonChatRequest;
export const requestHandlers: Record<
  string,
  typeof DEFAULT_HANDLER | typeof sendClaudeRequest
> = {
  custom: DEFAULT_HANDLER,
  anthropic: sendClaudeRequest,
  ...Object.fromEntries(
    Object.keys(API_ENDPOINTS).map((p) => [p, DEFAULT_HANDLER])
  ),
};

// 自动推断 Provider 类型 & 列表
export const availableProviderOptions = Object.keys(MODEL_MAP).filter(
  (provider) => provider !== "anthropic"
) as Array<keyof typeof MODEL_MAP>;
export type Provider = (typeof availableProviderOptions)[number];

/** 获取单个模型配置 */
export function getModelConfig(provider: Provider, name: string): Model {
  const list = MODEL_MAP[provider];
  if (!list) throw new Error(`Provider ${provider} not supported`);
  const model = list.find((m) => m.name === name);
  if (!model)
    throw new Error(`Model ${name} not found for provider ${provider}`);
  return model;
}

/** 获取某 provider 的所有模型 */
export function getModelsByProvider(provider: Provider): Model[] {
  return MODEL_MAP[provider] ?? [];
}

/** 获取 Chat Completion API 地址 */
export function getApiEndpoint({
  provider,
  customProviderUrl,
}: CybotConfig): string {
  if (customProviderUrl) return customProviderUrl;
  const key = provider.toLowerCase();
  if (key === "custom") {
    throw new Error(
      "Custom provider URL is required when provider is 'custom'."
    );
  }
  const url = API_ENDPOINTS[key];
  if (!url) throw new Error(`Unsupported provider: ${provider}`);
  return url;
}
