import { TokenRecord } from "./types";
/**
 * Convert enriched data to token record format
 */
export const createTokenRecord = (data): TokenRecord => ({
  id: data.id,
  userId: data.userId,
  username: data.username,
  cybotId: data.cybotId,
  model: data.model,
  provider: data.provider,
  cache_creation_input_tokens: data.cache_creation_input_tokens,
  cache_read_input_tokens: data.cache_read_input_tokens,
  output_tokens: data.output_tokens,
  input_tokens: data.input_tokens,
  cost: data.cost,
  createdAt: data.timestamp,
});
