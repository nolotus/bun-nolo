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
    [key: string]: any;
  };

  // 性能和能力
  performance?: {
    latency?: string;
    contextWindow?: number;
    maxOutputTokens?: number;
    [key: string]: any;
  };

  // 特性
  features?: {
    vision?: boolean;
    multilingual?: boolean;
    [key: string]: boolean | undefined;
  };

  // 训练信息
  training?: {
    dataCutoff?: string;
    [key: string]: any;
  };

  // 定价
  pricing: {
    input: number;
    output: number;
    unit?: string; // 例如 "per 1M tokens"
  };

  // 模型类型
  model: {
    type: string;
    [key: string]: any;
  };

  // 其他可能的字段
  [key: string]: any;
};

export type LLMModels = {
  [key: string]: LLMModel;
};

export interface LLMFormData {
  name: string;
  apiStyle: string;
  api: string;
  keyName?: string;
  model: string;
}
