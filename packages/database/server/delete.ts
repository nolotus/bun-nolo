// src/server/handlers/delete.ts
import { extractUserId } from "core/prefix";
import { isNil } from "rambda";
import { createKey } from "database/keys";
import serverDb from "./db";
import pino from "pino";

const logger = pino({ name: "handle-delete" });

export const handleDelete = async (req, res) => {
  try {
    const { userId: actionUserId } = req.user;
    const { id } = req.params;
    const type = new URL(req.url).searchParams.get("type");

    if (type === "messages") {
      const prefix = createKey("dialog", id, "msg");
      const batch = serverDb.batch();
      const deletedKeys = [];

      for await (const [key] of serverDb.iterator({
        gte: prefix,
        lte: prefix + "\uffff",
      })) {
        batch.del(key);
        deletedKeys.push(key);
      }

      await batch.write();
      logger.info({ id, count: deletedKeys.length }, "Batch deleted messages");

      return res.json({
        message: "Messages deleted successfully",
        processingIds: deletedKeys,
      });
    }

    const data = await serverDb.get(id);
    const ownerId = data?.userId || extractUserId(id);

    if (isNil(ownerId) || ownerId === actionUserId) {
      if (data) await serverDb.del(id);

      return res.json({
        message: "Delete request processed",
        processingIds: [id],
      });
    }

    return res.status(403).json({
      error: "Unauthorized action",
      processingIds: [],
    });
  } catch (error) {
    logger.error({ error }, "Delete handler error");
    return res.status(500).json({
      error: "Internal server error",
      processingIds: [],
    });
  }
};
