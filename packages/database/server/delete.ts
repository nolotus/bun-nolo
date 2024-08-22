// delete.ts

import { extractUserId } from "core/prefix";
import { deleteQueueCache } from "database/server/cache";
import { unlink } from "node:fs/promises";
import { readLines } from "utils/bun/readLines";
import { withUserLock } from "./userLock";
import { checkDeletePermission } from "./permissions";

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;
const TIMEOUT = 30000;

const removeDataFromFile = async (filePath, ids: string[]) => {
  const tempFilePath = `${filePath}.tmp`;
  const readStream = Bun.file(filePath).stream();
  const tempWriter = Bun.file(tempFilePath).writer();

  try {
    for await (const line of readLines(readStream)) {
      if (line.trim() === "") {
        continue;
      }
      const lineId = line.split(" ")[0];
      if (!ids.includes(lineId)) {
        await tempWriter.write(`${line}\n`);
      }
    }
    await tempWriter.end();
    await Bun.write(filePath, Bun.file(tempFilePath));
    await unlink(tempFilePath);
  } catch (error) {
    await unlink(tempFilePath);
    throw error;
  }
};

const deleteQueue = new Map<string, Set<string>>();
let isProcessing = false;

const processUserDeletion = async (userId: string, idsToDelete: string[]) => {
  const indexPath = `./nolodata/${userId}/index.nolo`;
  const hashPath = `./nolodata/${userId}/hash.nolo`;

  await Promise.all([
    removeDataFromFile(indexPath, idsToDelete),
    removeDataFromFile(hashPath, idsToDelete),
  ]);

  const userCache = deleteQueueCache.get(userId) || new Set();
  idsToDelete.forEach((id) => userCache.add(id));
  deleteQueueCache.set(userId, userCache);

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

const retryOperation = async (operation: () => Promise<void>) => {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      await Promise.race([
        operation(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Operation timed out")), TIMEOUT),
        ),
      ]);
      return;
    } catch (error) {
      console.error(
        `Operation failed (attempt ${attempt + 1}/${MAX_RETRIES}):`,
        error,
      );
      if (attempt === MAX_RETRIES - 1) throw error;
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

    if (!checkDeletePermission(actionUserId, dataBelongUserId)) {
      return res.status(403).json({ error: "Unauthorized action." });
    }

    const { ids = [] } = req.body || {};
    const allIds = [id, ...ids];

    await withUserLock(dataBelongUserId, async () => {
      const alreadyDeletedIds = allIds.filter(
        (id) =>
          deleteQueueCache.get(dataBelongUserId)?.has(id) ||
          isIdQueued(dataBelongUserId, id),
      );

      const idsToDelete = allIds.filter(
        (id) => !alreadyDeletedIds.includes(id),
      );

      if (idsToDelete.length > 0) {
        enqueueDelete(dataBelongUserId, idsToDelete);
      }

      return res.status(200).json({
        message: "Delete request processed",
        deletedIds: alreadyDeletedIds,
        processingIds: idsToDelete,
      });
    });
  } catch (error) {
    console.error("Error in handleDelete:", error);
    return res.status(500).json({ error: "An internal server error occurred" });
  }
};
