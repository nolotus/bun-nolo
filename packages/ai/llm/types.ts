export interface Model {
  name: string;
  displayName?: string; // 可选的displayName字段
  hasVision: boolean;
  contextWindow?: any;
  price?: {
    input: number; // Price per 1 million tokens for input
    output: number; // Price per 1 million tokens for output
  };
  speed?: number;
  maxOutputTokens?: any;
}
