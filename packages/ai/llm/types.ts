export interface ModelPrice {
  input: number;
  output: number;
  cachingWrite?: number;
  cachingRead?: number;
  inputCacheHit?: number; // 为DeepSeek模型保留
}

export interface Model {
  name: string;
  displayName?: string; // 可选的 displayName 字段
  hasVision: boolean;
  contextWindow?: any;
  price: ModelPrice;
  speed?: number; // 处理速度，单位可以是每秒令牌数
  maxOutputTokens?: any; // 最大输出令牌数
  jsonOutput?: boolean; // 是否支持 JSON 结构化输出
  fnCall?: boolean; // 是否支持函数调用
  provider?: string; // 供应商
  description?: string; // 描述
  strengths?: string; // 优势
  hasAudio?: boolean; // 是否支持音频输入
  performance?: {
    latency: string; // 延迟
  };
  maxImageResolution?: string; // 最大图像分辨率
}
