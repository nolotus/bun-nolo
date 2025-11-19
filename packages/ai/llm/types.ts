// ai/llm/types.ts

export interface ModelPrice {
  input: number;
  output: number;
  cachingWrite?: number;
  cachingRead?: number;
  inputCacheHit?: number; // 为DeepSeek模型保留
}

// 新增：定价阶梯定义
export interface PricingTier {
  minContext: number; // 触发此价格的最小 Token 数 (例如 200001)
  price: ModelPrice; // 此阶梯对应的完整价格表
}

// 新增：定价策略定义
export interface PricingStrategy {
  type: "tiered_context"; // 目前支持基于上下文长度的阶梯定价
  tiers: PricingTier[];
}

export interface Model {
  name: string;
  displayName?: string; // 可选的 displayName 字段
  hasVision: boolean;
  contextWindow?: any; // 建议改为 number，但保持你原有的 any 兼容
  price: ModelPrice; // 基础/默认价格

  // 新增字段：支持高级定价策略
  pricingStrategy?: PricingStrategy;

  maxOutputTokens?: any; // 最大输出令牌数，建议改为 number
  jsonOutput?: boolean; // 是否支持 JSON 结构化输出
  fnCall?: boolean; // 是否支持函数调用
  provider?: string; // 供应商
  description?: string; // 描述
  hasAudio?: boolean; // 是否支持音频输入
  maxImageResolution?: string; // 最大图像分辨率
  canFineTune?: boolean; // 是否可以微调
  hasImageOutput?: boolean; // 是否支持图片输出
  supportsReasoningEffort?: boolean; // 是否支持推理功能
  endpointKey?: string;
}
