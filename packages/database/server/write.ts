// database/server/write.ts

import { promises as fs } from "fs";
import { dirname } from "path";
import serverDb from "./db";
import { logger } from "auth/server/shared";
import { deductUserBalance } from "auth/server/deduct";
import { DataType } from "create/types";

export const doesUserDirectoryExist = async (
  userId: string
): Promise<boolean> => {
  const path = `./nolodata/${userId}/index.nolo`;

  try {
    await fs.access(dirname(path));
    return true;
  } catch {
    return false;
  }
};

export const handleWrite = async (req: any, res: any) => {
  const { user } = req;
  const actionUserId = user.userId;

  const { userId, data, customId } = req.body;
  const saveUserId = userId || data.userId;

  if (saveUserId === "local") {
    logger.warn({
      event: "local_write_rejected",
      actionUserId,
    });
    return res.status(400).json({
      message: "local data is not allowed.",
    });
  }

  const isWriteSelf = actionUserId === saveUserId;

  const userExist = await serverDb.get(`user:${actionUserId}`);
  const allowWrite = isWriteSelf && userExist;

  if (!allowWrite) {
    if (!userExist) {
      logger.warn({
        event: "write_permission_denied",
        actionUserId,
        targetUserId: saveUserId,
        dataType: data.type,
        error: "用户不存在",
      });
      return res.status(403).json({
        message: "操作不被允许：用户不存在",
        error: "用户不存在",
      });
    } else if (!isWriteSelf) {
      logger.warn({
        event: "write_permission_denied",
        actionUserId,
        targetUserId: saveUserId,
        dataType: data.type,
        error: `用户 ${actionUserId} 无权写入用户 ${saveUserId} 的数据`,
      });
      return res.status(403).json({
        message: `操作不被允许：用户 ${actionUserId} 无权写入用户 ${saveUserId} 的数据`,
        error: `无权写入，当前用户：${actionUserId}，写入目标用户：${saveUserId}`,
      });
    }
  }

  try {
    const id = customId;

    // Token类型的处理
    if (data.type === DataType.TOKEN) {
      const isStatsKey = id.includes("token-stats");

      // 1. 先保存 token 使用记录
      await serverDb.put(id, data);

      // 2. 非统计类数据且有 cost 时进行扣费
      if (!isStatsKey && data.cost && data.cost > 0) {
        try {
          const txId = `token-${id}`;
          logger.info({
            event: "token_deduct_start",
            userId: data.userId,
            cost: data.cost,
            txId,
          });
          const deductResult = await deductUserBalance(
            data.userId,
            data.cost,
            `Token generation cost: ${id}`,
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
            id,
          });

          return res.status(500).json({
            message: "Token usage recorded but payment system error",
            error: "Internal server error",
          });
        }
      }

      // 3. Token数据保存成功的响应
      return res.status(200).json({
        message: "Token usage recorded successfully",
        id,
        ...data,
      });
    }

    // CYBOT 类型的处理
    if (data.type === DataType.CYBOT) {
      try {
        logger.info({
          event: "cybot_save",
          id,
          name: data.name,
          userId: data.userId,
          isPublic: data.isPublic,
        });

        await serverDb.put(id, data);
        const savedData = await serverDb.get(id);

        const isDataMatch = JSON.stringify(data) === JSON.stringify(savedData);
        if (!isDataMatch) {
          logger.error({
            event: "cybot_data_mismatch",
            id,
            name: data.name,
          });
          throw new Error("Data validation failed");
        }

        return res.status(200).json({
          message: "Data written successfully",
          id,
          ...data,
        });
      } catch (error) {
        logger.error({
          event: "cybot_save_failed",
          error: error.message,
          id,
          name: data.name,
        });
        throw error;
      }
    }

    // 其他数据类型的处理
    if (
      data.type === DataType.MSG ||
      data.type === DataType.PAGE ||
      data.type === DataType.DIALOG
    ) {
      await serverDb.put(id, data);
      return res.status(200).json({
        message: "Data written to file successfully.",
        id,
        ...data,
      });
    }

    return res.status(400).json({
      message: "Invalid data type",
    });
  } catch (error) {
    logger.error({
      event: "write_failed",
      error,
      data: { id: customId, type: data.type },
    });
    return res.status(500).json({
      message: "Failed to write data",
      error,
    });
  }
};
