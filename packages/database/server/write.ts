// database/server/write.ts

import { logger } from "auth/server/shared";
import { DataType } from "create/types";
import serverDb from "./db";
import { handleToken, handleCybot, handleOtherDataTypes } from "./dataHandlers";
import { handleTransaction } from "./handleTransaction";

export const handleWrite = async (req: any, res: any) => {
  const { user } = req;
  const actionUserId = user.userId;

  const { userId, data, customKey } = req.body;
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
  }
  const allowWrite = isWriteSelf && userExist;

  if (!allowWrite && !isWriteSelf) {
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

  try {
    const dataType = data.type;
    let result;
    switch (dataType) {
      case DataType.TRANSACTION:
        result = await handleTransaction(data, res, customKey, actionUserId);
        break;
      case DataType.TOKEN:
        result = await handleToken(data, res, userId, customKey, actionUserId);
        break;
      case DataType.CYBOT:
        result = await handleCybot(data, res, customKey);
        break;
      default:
        result = await handleOtherDataTypes(data, res, customKey);
        break;
    }

    if (result) return result;

    return res.status(400).json({
      message: "Invalid data type",
    });
  } catch (error) {
    logger.error({
      event: "write_failed",
      error,
      data: { id: customKey, dbKey: customKey, type: data.type },
    });
    return res.status(500).json({
      message: "Failed to write data",
      error,
    });
  }
};
