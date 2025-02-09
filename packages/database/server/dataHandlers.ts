import { logger } from "auth/server/shared";
import { deductUserBalance } from "auth/server/deduct";
import { DataType } from "create/types";
import serverDb from "./db";

export const handleToken = async (
  data: any,
  res: any,
  userId: string,
  customId: string,
  actionUserId: string
) => {
  const isStatsKey = customId.includes("token-stats");

  await serverDb.put(customId, data);

  if (!isStatsKey && data.cost && data.cost > 0) {
    try {
      const txId = `token-${customId}`;
      logger.info({
        event: "token_deduct_start",
        userId: data.userId,
        cost: data.cost,
        txId,
      });
      const deductResult = await deductUserBalance(
        data.userId,
        data.cost,
        `Token generation cost: ${customId}`,
        txId
      );
      logger.info({
        event: "token_deduct_result",
        userId: data.userId,
        cost: data.cost,
        txId,
        deductResult,
      });

      if (!deductResult.success) {
        logger.warn({
          event: "token_deduct_failed",
          error: deductResult.error,
          userId: data.userId,
          cost: data.cost,
          txId,
        });

        return res.status(402).json({
          message: "Token usage recorded but payment failed",
          error: deductResult.error,
        });
      }
    } catch (error) {
      logger.error({
        event: "token_deduct_error",
        error: error.message,
        userId: data.userId,
        id: customId,
      });

      return res.status(500).json({
        message: "Token usage recorded but payment system error",
        error: "Internal server error",
      });
    }
  }

  return res.status(200).json({
    message: "Token usage recorded successfully",
    id: customId,
    ...data,
  });
};

export const handleCybot = async (data: any, res: any, customId: string) => {
  try {
    logger.info({
      event: "cybot_save",
      id: customId,
      name: data.name,
      userId: data.userId,
      isPublic: data.isPublic,
    });

    await serverDb.put(customId, data);
    const savedData = await serverDb.get(customId);

    const isDataMatch = JSON.stringify(data) === JSON.stringify(savedData);
    if (!isDataMatch) {
      logger.error({
        event: "cybot_data_mismatch",
        id: customId,
        name: data.name,
      });
      throw new Error("Data validation failed");
    }

    return res.status(200).json({
      message: "Data written successfully",
      id: customId,
      ...data,
    });
  } catch (error) {
    logger.error({
      event: "cybot_save_failed",
      error: error.message,
      id: customId,
      name: data.name,
    });
    throw error;
  }
};

export const handleOtherDataTypes = async (
  data: any,
  res: any,
  customId: string
) => {
  if (
    data.type === DataType.MSG ||
    data.type === DataType.PAGE ||
    data.type === DataType.DIALOG
  ) {
    await serverDb.put(customId, data);
    return res.status(200).json({
      message: "Data written to file successfully.",
      id: customId,
      ...data,
    });
  }
};
