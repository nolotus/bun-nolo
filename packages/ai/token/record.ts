import { enrichData } from "./utils";
import { createTokenKey } from "database/keys";
import { browserDb } from "database/browser/db";
import { RequiredData, TokenRecord } from "./types";

/**
 * Convert enriched data to token record format
 */
const createTokenRecord = (
  data: ReturnType<typeof enrichData>
): TokenRecord => ({
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

/**
 * Save token usage record to database
 */
export const saveTokenRecord = async (
  data: RequiredData
): Promise<TokenRecord> => {
  try {
    const enrichedData = enrichData(data);
    const record = createTokenRecord(enrichedData);
    const timestamp = new Date(record.createdAt).getTime();

    const key = createTokenKey.record(data.userId, timestamp);

    console.info({ key, timestamp }, "Saving token record");
    await browserDb.put(key, record);

    return record;
  } catch (error) {
    console.error({ error }, "Save failed");
    throw error;
  }
};
