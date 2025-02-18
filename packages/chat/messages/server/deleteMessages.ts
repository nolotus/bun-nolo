import { createKey } from "database/keys";
import serverDb from "database/server/db";

export async function deleteMessages(dialogId: string) {
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
