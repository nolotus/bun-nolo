import { DataType } from "create/types";
import { extractUserId } from "core/prefix";
import { saveTokenUsage } from "ai/token/db";
import { TokenUsageData } from "ai/token/types";
import { normalizeUsage } from "ai/token/normalizeUsage";
import { calculatePrice } from "ai/token/calculatePrice";
import { pino } from "pino";

const logger = pino({ name: "token-action" });

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

  logger.debug({ externalPrice }, "Calculating token price");

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
    // 移除date字段，让db层处理时间戳
    type: DataType.TOKEN,
    dialogId,
    cost: result.cost,
    pay: result.pay,
  };

  try {
    await saveTokenUsage(data, thunkApi);
    logger.info(
      {
        dialogId,
        model: cybotConfig.model,
        tokens: {
          input: usage.input_tokens,
          output: usage.output_tokens,
        },
      },
      "Token usage saved"
    );
  } catch (error) {
    logger.error({ error }, "Failed to save token usage");
    throw error;
  }

  return {
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
  };
};
