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
