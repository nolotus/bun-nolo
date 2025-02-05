import { TokenUsageData, TokenRecord } from "ai/token/types";
import { DataType } from "create/types";
import { createTokenKey } from "database/keys";
import { write } from "database/dbSlice";
import toast from "react-hot-toast";
import { pino } from "pino";

const logger = pino({ name: "token-record", level: "info" });

type TokenCount = { input: number; output: number };

export interface ModelStats {
  count: number;
  tokens: TokenCount;
  cost: number;
}

export const createTokenRecord = (
  data: TokenUsageData,
  { cost, inputPrice, outputPrice }: Partial<TokenRecord> = {}
): TokenRecord => ({
  ...data,
  cost: cost || data.cost,
  inputPrice,
  outputPrice,
});

export const saveTokenRecord = async (
  tokenData: TokenUsageData,
  record: TokenRecord,
  thunkApi
) => {
  const key = createTokenKey.record(tokenData.userId, tokenData.timestamp);

  try {
    await thunkApi.dispatch(
      write({
        data: { ...record, id: key, type: DataType.TOKEN },
        customId: key,
      })
    );
    return true;
  } catch (error) {
    logger.error(
      {
        key,
        userId: tokenData.userId,
        error: error.message,
      },
      "Failed to save token record"
    );
    toast.error("Failed to save token record");
    return false;
  }
};
