import { extractUserId } from "core/prefix";
import { removeDataFromFile } from "utils/file";
import { cache } from "database/server/cache";

// 删除队列
const deleteQueue = new Map<string, Set<string>>();
let isProcessing = false;

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds
const TIMEOUT = 30000; // 30 seconds

const processUserDeletion = async (userId: string, idsToDelete: string[]) => {
  const indexPath = `./nolodata/${userId}/index.nolo`;
  const hashPath = `./nolodata/${userId}/hash.nolo`;

  await Promise.all([
    removeDataFromFile(indexPath, idsToDelete),
    removeDataFromFile(hashPath, idsToDelete),
  ]);

  // 删除成功后，将这些 ID 添加到缓存中
  const userCache = cache.get(userId) || new Set();
  idsToDelete.forEach((id) => userCache.add(id));
  cache.set(userId, userCache);

  console.log(
    `Successfully deleted ${idsToDelete.length} items for user ${userId}`,
  );
};
const processDeleteQueue = async () => {
  if (isProcessing) return;
  isProcessing = true;

  try {
    for (const [userId, ids] of deleteQueue.entries()) {
      const idsToDelete = Array.from(ids);
      deleteQueue.delete(userId);

      await retryOperation(() => processUserDeletion(userId, idsToDelete));
    }
  } finally {
    isProcessing = false;
  }
};

const enqueueDelete = (userId: string, ids: string[]) => {
  const userQueue = deleteQueue.get(userId) || new Set();
  ids.forEach((id) => userQueue.add(id));
  deleteQueue.set(userId, userQueue);

  if (!isProcessing) {
    processDeleteQueue().catch(console.error);
  }
};

const validateUserAction = (actionUserId: string, dataBelongUserId: string) => {
  if (actionUserId !== dataBelongUserId) {
    throw new Error("Unauthorized action.");
  }
};

const retryOperation = async (operation: () => Promise<void>) => {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      await Promise.race([
        operation(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Operation timed out")), TIMEOUT),
        ),
      ]);
      return; // 操作成功，直接返回
    } catch (error) {
      console.error(
        `Operation failed (attempt ${attempt + 1}/${MAX_RETRIES}):`,
        error,
      );
      if (attempt === MAX_RETRIES - 1) throw error; // 最后一次尝试失败，抛出错误
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
  }
};

const isIdQueued = (userId: string, id: string): boolean => {
  return deleteQueue.get(userId)?.has(id) || false;
};

export const handleDelete = async (req, res) => {
  try {
    const { userId: actionUserId } = req.user;
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "ID parameter is missing." });
    }
    const dataBelongUserId = extractUserId(id);
    validateUserAction(actionUserId, dataBelongUserId);

    const { ids = [] } = req.body || {};
    const allIds = [id, ...ids];

    const alreadyDeletedIds = allIds.filter(
      (id) =>
        cache.get(dataBelongUserId)?.has(id) ||
        isIdQueued(dataBelongUserId, id),
    );

    const idsToDelete = allIds.filter((id) => !alreadyDeletedIds.includes(id));

    if (idsToDelete.length > 0) {
      enqueueDelete(dataBelongUserId, idsToDelete);
    }

    return res.status(200).json({
      message: "Delete request processed",
      deletedIds: alreadyDeletedIds,
      processingIds: idsToDelete,
    });
  } catch (error) {
    console.error("Error in handleDelete:", error);
    return res.status(500).json({ error: "An internal server error occurred" });
  }
};
