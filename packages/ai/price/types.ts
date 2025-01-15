export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
}

export interface ModelPrice {
  input: number;
  output: number;
  cachingWrite?: number;
  cachingRead?: number;
}

export interface ExternalPrice {
  input: number;
  output: number;
  creatorId?: string;
}

export interface PriceResult {
  cost: number;
  pay: Record<string, number>;
}

export interface CalculatePriceParams {
  modelName: string;
  usage: TokenUsage;
  externalPrice?: ExternalPrice;
  provider: string;
}
