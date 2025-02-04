import { DataType } from "create/types";
import { extractUserId } from "core/prefix";
import { saveTokenUsage } from "ai/token/db";
import { TokenUsageData } from "ai/token/types";
import { TokenRecord } from "ai/token/types";
import { normalizeUsage } from "ai/token/normalizeUsage";
import { calculatePrice } from "ai/token/calculatePrice";
import { createTokenKey } from "database/keys";
import { ulid } from "ulid";
import { format } from "date-fns";
import { write } from "database/dbSlice";

/**
 * 创建Token记录
 */
export const createTokenRecord = (
  data: TokenUsageData,
  additionalData?: {
    cost?: number;
    inputPrice?: number;
    outputPrice?: number;
    inputTokens?: number;
    outputTokens?: number;
  }
): TokenRecord => ({
  id: data.id,
  userId: data.userId,
  username: data.username,
  cybotId: data.cybotId,
  model: data.model,
  provider: data.provider,
  dialogId: data.dialogId,
  cache_creation_input_tokens: data.cache_creation_input_tokens,
  cache_read_input_tokens: data.cache_read_input_tokens,
  output_tokens: data.output_tokens,
  input_tokens: data.input_tokens,
  cost: additionalData?.cost || data.cost,
  pay: data.pay,
  createdAt: data.timestamp,
  type: data.type,
  inputPrice: additionalData?.inputPrice,
  outputPrice: additionalData?.outputPrice,
});

/**
 * 更新tokens的action
 */
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

  const timestamp = Date.now();
  const data: TokenUsageData = {
    ...usage,
    userId: auth?.currentUser?.userId,
    username: auth?.currentUser?.username, // 假设 auth 对象中有 username 属性
    cybotId: cybotConfig.id,
    model: cybotConfig.model,
    provider: cybotConfig.provider,
    type: DataType.TOKEN,
    dialogId,
    cost: result.cost,
    pay: result.pay,
    timestamp,
    id: ulid(timestamp),
    dateKey: format(timestamp, "yyyy-MM-dd"),
  };

  try {
    const record = createTokenRecord(data, {
      cost: result.cost,
      inputPrice: cybotConfig.inputPrice,
      outputPrice: cybotConfig.outputPrice,
      inputTokens: usage.input_tokens,
      outputTokens: usage.output_tokens,
    });
    const key = createTokenKey.record(data.userId, data.timestamp);

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
