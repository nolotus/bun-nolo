import { extractUserId } from "core/prefix";
import { removeDataFromFile } from "utils/file";
import { cache, isIdInCache } from "database/server/cache";

// 删除队列
const deleteQueue = new Map<string, Set<string>>();
// 正在处理的删除操作
const processingDeletes = new Set<string>();

// 处理删除队列的函数
const processDeleteQueue = async () => {
  for (const [userId, ids] of deleteQueue.entries()) {
    const idsToDelete = Array.from(ids);
    deleteQueue.delete(userId);

    // 将这些 ID 标记为正在处理
    idsToDelete.forEach((id) => processingDeletes.add(`${userId}:${id}`));

    try {
      const indexPath = `./nolodata/${userId}/index.nolo`;
      const hashPath = `./nolodata/${userId}/hash.nolo`;
      await Promise.all([
        removeDataFromFile(indexPath, idsToDelete),
        removeDataFromFile(hashPath, idsToDelete),
      ]);

      // 删除成功后，将这些 ID 添加到缓存中
      if (!cache.has(userId)) {
        cache.set(userId, new Set());
      }
      idsToDelete.forEach((id) => cache.get(userId)!.add(id));
    } catch (error) {
      console.error(`Error deleting data for user ${userId}:`, error);
    } finally {
      // 无论成功与否，都从处理集合中移除这些 ID
      idsToDelete.forEach((id) => processingDeletes.delete(`${userId}:${id}`));
    }
  }
};

const deleteData = async (userId: string, ids: string[]) => {
  if (!deleteQueue.has(userId)) {
    deleteQueue.set(userId, new Set());
  }
  ids.forEach((id) => deleteQueue.get(userId)!.add(id));

  // 触发队列处理
  setTimeout(processDeleteQueue, 0);
};

const isIdBeingDeleted = (userId: string, id: string): boolean => {
  return (
    processingDeletes.has(`${userId}:${id}`) ||
    (deleteQueue.has(userId) && deleteQueue.get(userId)!.has(id))
  );
};

const validateUserAction = (actionUserId: string, dataBelongUserId: string) => {
  if (actionUserId !== dataBelongUserId) {
    throw new Error("Unauthorized action.");
  }
};

const handleIdsDeletion = async (userId: string, ids: string[]) => {
  if (ids && ids.length > 0) {
    await deleteData(userId, ids);
  }
};

export const handleDelete = async (req, res) => {
  const { userId: actionUserId } = req.user;
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "ID parameter is missing." });
  }
  const dataBelongUserId = extractUserId(id);
  validateUserAction(actionUserId, dataBelongUserId);

  const { ids = [] } = req.body || {};
  const allIds = [id, ...ids];

  // 检查是否有 ID 已经在缓存或正在删除中
  const alreadyDeletedIds = allIds.filter(
    (id) =>
      isIdInCache(dataBelongUserId, id) ||
      isIdBeingDeleted(dataBelongUserId, id),
  );

  // 过滤出需要删除的 ID
  const idsToDelete = allIds.filter((id) => !alreadyDeletedIds.includes(id));

  if (idsToDelete.length > 0) {
    await deleteData(dataBelongUserId, idsToDelete);
  }

  return res.status(200).json({
    message: "Delete request processed",
    deletedIds: alreadyDeletedIds,
    processingIds: idsToDelete,
  });
};
