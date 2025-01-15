import { extractUserId } from "core/prefix";
import { isNil } from "rambda";
import { pino } from "pino";
import { createKey } from "database/keys";

import { mem } from "./mem";
import serverDb from "./db";

const logger = pino({ name: "handle-delete" });

const checkDeletePermission = (
  actionUserId: string,
  dataBelongUserId: string
): boolean => actionUserId === dataBelongUserId;

const batchDeleteMessages = async (db, dialogId) => {
  const prefix = createKey("dialog", dialogId, "msg");
  const batch = db.batch();
  const deletedKeys = [];

  try {
    for await (const [key] of db.iterator({
      gte: prefix,
      lte: prefix + "\uffff",
    })) {
      batch.del(key);
      deletedKeys.push(key);
    }
    await batch.write();
    return deletedKeys;
  } catch (err) {
    logger.error({ err, dialogId }, "Failed to batch delete messages");
    throw err;
  }
};

export const handleDelete = async (req, res) => {
  try {
    const { userId: actionUserId } = req.user;
    const { id } = req.params;
    const type = new URL(req.url).searchParams.get("type");

    if (type === "messages") {
      const dialogId = id;
      const deletedKeys = await batchDeleteMessages(serverDb, dialogId);

      logger.info(
        {
          dialogId,
          count: deletedKeys.length,
        },
        "Batch deleted messages"
      );

      return res.status(200).json({
        message: "Messages deleted successfully",
        processingIds: deletedKeys,
      });
    }

    // 常规单条数据删除逻辑
    const willDeleteData = await serverDb.get(id);
    const dataBelongUserId = willDeleteData
      ? willDeleteData.userId
      : extractUserId(id);

    if (isNil(dataBelongUserId)) {
      mem.set(id, "0");
      serverDb.del(id);
      return res.status(200).json({
        message: "Delete request processed for unknown owner",
        processingIds: [id],
      });
    }

    if (!checkDeletePermission(actionUserId, dataBelongUserId)) {
      return res.status(403).json({ error: "Unauthorized action." });
    }

    if (willDeleteData) {
      await serverDb.del(id);
    } else {
      mem.set(id, "0");
    }

    return res.status(200).json({
      message: "Delete request processed",
      processingIds: [id],
    });
  } catch (error) {
    logger.error({ error }, "Error in handleDelete");
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};
