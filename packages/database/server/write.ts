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

interface TokenData {
  type: DataType.TOKEN;
  userId: string;
  cost?: number;
  pay?: number;
}

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

    // Token类型特殊处理
    if (data.type === DataType.TOKEN) {
      const tokenData = data as TokenData;
      const isStatsKey = id.includes("token-stats");

      // 非统计数据尝试扣费
      if (!isStatsKey && tokenData.cost && tokenData.cost > 0) {
        try {
          const deductResult = await deductUserBalance(
            tokenData.userId,
            tokenData.cost,
            `Token generation cost: ${id}`
          );

          if (deductResult.success) {
            logger.info({
              event: "token_cost_deducted",
              userId: tokenData.userId,
              cost: tokenData.cost,
              tokenId: id,
              remainingBalance: deductResult.balance,
            });
          } else {
            logger.warn({
              event: "token_cost_deduction_failed",
              userId: tokenData.userId,
              cost: tokenData.cost,
              tokenId: id,
              error: deductResult.error,
            });
          }
        } catch (deductError) {
          logger.error({
            event: "token_cost_deduction_error",
            error: deductError,
            userId: tokenData.userId,
            tokenId: id,
          });
        }
      }
    }

    // 无论扣费是否成功，都保存数据
    if (
      data.type === DataType.TOKEN ||
      data.type === DataType.MSG ||
      data.type === DataType.PAGE ||
      data.type === DataType.CYBOT ||
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
