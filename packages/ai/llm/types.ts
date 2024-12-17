export interface Model {
  name: string;
  displayName?: string; // 可选的 displayName 字段
  hasVision: boolean;
  contextWindow?: any;
  price?: {
    input: number; // 每百万个输入令牌的价格
    output: number; // 每百万个输出令牌的价格
  };
  speed?: number; // 处理速度，单位可以是每秒令牌数
  maxOutputTokens?: any; // 最大输出令牌数
  jsonOutput?: boolean; // 是否支持 JSON 结构化输出
  fnCall?: boolean; // 是否支持函数调用
}
