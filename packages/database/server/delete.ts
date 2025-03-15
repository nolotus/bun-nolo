// src/server/handlers/delete.ts
import { isNil } from "rambda";
import serverDb from "./db";
import { deleteMessages } from "chat/messages/server/deleteMessages";
import { nolotusId } from "core/init"; // 导入 nolotusId

// 处理 cybot-pub 开头数据的权限检查
const canDeleteCybotPubData = (id: string, actionUserId: string): boolean => {
  const isCybotPubData = id.startsWith("cybot-pub");
  const isNolotusUser = actionUserId === nolotusId;
  return isCybotPubData && isNolotusUser;
};

export const handleDelete = async (req, res) => {
  try {
    const { userId: actionUserId } = req.user; // 操作人的 userId
    const { id } = req.params; // 要删除的数据的 id
    const type = new URL(req.url).searchParams.get("type");

    // 调用独立的删除消息函数
    if (type === "messages") {
      const result = await deleteMessages(id);
      return res.status(200).json(result);
    }

    // 获取数据
    const data = await serverDb.get(id);
    const ownerId = data?.userId; // 数据的所有者 userId

    // 权限检查逻辑
    if (
      isNil(ownerId) || // 数据无主
      ownerId === actionUserId || // 操作人是所有者
      canDeleteCybotPubData(id, actionUserId) // cybot-pub 数据且操作人是 nolotusId
    ) {
      if (data) {
        await serverDb.del(id); // 如果数据存在，删除
      }

      return res.status(200).json({
        message: "Delete request processed",
        processingIds: [id],
      });
    }

    // 未授权的情况
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
