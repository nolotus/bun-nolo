// src/server/handlers/delete.ts
import { extractUserId } from "core/prefix";
import { isNil } from "rambda";
import { createKey } from "database/keys";
import serverDb from "./db";

async function deleteMessages(dialogId: string) {
  const prefix = createKey("dialog", dialogId, "msg");
  const batch = serverDb.batch();
  const deletedKeys: string[] = [];

  // 遍历并收集所有消息键
  for await (const [key] of serverDb.iterator({
    gte: prefix,
    lte: prefix + "\uffff",
  })) {
    batch.del(key);
    deletedKeys.push(key);
  }

  // 批量执行删除操作
  await batch.write();

  return {
    message: "Messages deleted successfully",
    processingIds: deletedKeys,
  };
}

export const handleDelete = async (req, res) => {
  try {
    const { userId: actionUserId } = req.user;
    const { id } = req.params;
    const type = new URL(req.url).searchParams.get("type");

    // 调用独立的删除消息函数
    if (type === "messages") {
      const result = await deleteMessages(id);
      return res.status(200).json(result);
    }

    // 原有其他类型删除逻辑保持不变
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
      ownerId,
      actionUserId,
      processingIds: [],
    });
  } catch (error) {
    // logger.error({ error }, "Delete handler error");
    return res.status(500).json({
      error: "Internal server error",
      processingIds: [],
    });
  }
};
