import { DataType } from "create/types";
import { extractUserId } from "core/prefix";
import { saveTokenUsage } from "ai/token/db";
import { TokenUsageData } from "ai/token/types";
import { normalizeUsage } from "ai/token/normalizeUsage";
import { calculatePrice } from "ai/token/calculatePrice";
import { createTokenRecord } from "ai/token/record";
import { createTokenKey } from "database/keys";
import { ulid } from "ulid";
import { format } from "date-fns";
import { write } from "database/dbSlice";

const enrichData = (data: TokenUsageData) => {
  const timestamp = Date.now();
  return {
    ...data,
    timestamp,
    id: ulid(timestamp),
    dateKey: format(timestamp, "yyyy-MM-dd"),
  };
};

export const updateTokensAction = async (
  { dialogId, usage: usageRaw, cybotConfig },
  thunkApi
) => {
  const state = thunkApi.getState();
  const auth = state.auth;

  const provider = cybotConfig.provider;
  const creatorId = extractUserId(cybotConfig.id);

  const externalPrice = {
    input: cybotConfig.inputPrice,
    output: cybotConfig.outputPrice,
    creatorId,
  };

  const usage = normalizeUsage(usageRaw);

  const result = calculatePrice({
    provider,
    modelName: cybotConfig.model,
    usage,
    externalPrice,
  });

  const data: TokenUsageData = {
    ...usage,
    userId: auth?.currentUser?.userId,
    cybotId: cybotConfig.id,
    model: cybotConfig.model,
    provider: cybotConfig.provider,
    type: DataType.TOKEN,
    dialogId,
    cost: result.cost,
    pay: result.pay,
  };

  try {
    const enrichedData = enrichData(data);
    const record = createTokenRecord(enrichedData);

    const key = createTokenKey.record(data.userId, enrichedData.timestamp);

    await thunkApi.dispatch(
      write({
        data: {
          ...record,
          id: key,
          type: DataType.TOKEN,
        },
        customId: key,
      })
    );

    await saveTokenUsage(data, thunkApi);
  } catch (error) {
    throw error;
  }

  return {
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
  };
};
