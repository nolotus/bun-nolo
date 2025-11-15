// ai/llm/models.ts

import type { Model } from "./types";

// 导入所有提供商的模型数据
import { deepSeekModels } from "integrations/deepseek/models";
import { googleModels } from "integrations/google/models";
import { mistralModels } from "integrations/mistral/models";
// import { openAIModels } from "integrations/openai/models";
import { sambanovaModels } from "integrations/sambanova/models";
import { openrouterModels } from "integrations/openrouter/models";
import { xaiModels } from "integrations/xai/models";

/**
 * @interface ModelWithProvider
 * 扩展基础 Model 类型，增加了 provider 字段，用于UI显示和逻辑处理。
 */
export interface ModelWithProvider extends Model {
  provider: string;
}

/**
 * @const ALL_MODELS
 * 聚合了所有来源的模型数据，并为每个模型附加了其提供商信息。
 * 这是整个应用中模型选择器的唯一数据源。
 */
export const ALL_MODELS: ModelWithProvider[] = [
  ...googleModels.map((m) => ({ ...m, provider: "google" })),
  // ...openAIModels.map((m) => ({ ...m, provider: "openai" })),
  ...openrouterModels.map((m) => ({ ...m, provider: "openrouter" })),
  ...xaiModels.map((m) => ({ ...m, provider: "xai" })),
  ...deepSeekModels.map((m) => ({ ...m, provider: "deepseek" })),
  ...sambanovaModels.map((m) => ({ ...m, provider: "sambanova" })),
  ...mistralModels.map((m) => ({ ...m, provider: "mistral" })),
];
