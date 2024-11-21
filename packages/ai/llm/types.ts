type LLMModel = {
  // 基本信息
  provider: string;
  name: string;
  description?: string;
  strengths?: string;

  // API 相关
  api: {
    name: string;
    format?: string;
  };

  // 性能和能力
  performance?: {
    latency?: string;
    contextWindow?: number;
    maxOutputTokens?: number;
  };

  // 特性
  features?: {
    vision?: boolean;
  };

  // 模型类型
  model: {
    type: string;
    [key: string]: any;
  };
};

export interface Model {
  name: string;
  displayName?: string; // 可选的displayName字段
  hasVision: boolean;
  contextWindow?: number; // For context window information
  price?: {
    input: number; // Price per 1 million tokens for input
    output: number; // Price per 1 million tokens for output
  };
  speed?: number;
}
