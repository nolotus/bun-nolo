// database/server/write.ts

import { promises as fs } from "fs";
import { dirname } from "path";
import { logger } from "auth/server/shared";
import { DataType } from "create/types";
import serverDb from "./db";
import { handleToken, handleCybot, handleOtherDataTypes } from "./dataHandlers";
import { handleTransaction } from "./handleTransaction";
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
    const dataType = data.type;

    let result;

    switch (dataType) {
      case DataType.TRANSACTION:
        result = await handleTransaction(data, res, customId, actionUserId);
        break;
      case DataType.TOKEN:
        result = await handleToken(data, res, userId, customId, actionUserId);
        break;
      case DataType.CYBOT:
        result = await handleCybot(data, res, customId);
        break;
      default:
        result = await handleOtherDataTypes(data, res, customId);
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
      data: { id: customId, type: data.type },
    });
    return res.status(500).json({
      message: "Failed to write data",
      error,
    });
  }
};
