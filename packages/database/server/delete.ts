import { extractUserId } from "core/prefix";
import { unlink, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { readLines } from "utils/bun/readLines";
import { checkDeletePermission } from "./permissions";
import { mem } from "./mem";

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;
const TIMEOUT = 30000;

const removeDataFromFile = async (filePath, ids: string[]) => {
  if (!existsSync(filePath)) {
    console.log(`File ${filePath} does not exist. Skipping deletion.`);
    return;
  }

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
    if (existsSync(tempFilePath)) {
      await unlink(tempFilePath);
    }
    throw error;
  }
};

const processUserDeletion = async (userId: string, idsToDelete: string[]) => {
  const userDataDir = `./nolodata/${userId}`;
  const indexPath = `${userDataDir}/index.nolo`;

  try {
    await mkdir(userDataDir, { recursive: true });
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }

  await removeDataFromFile(indexPath, idsToDelete);

  console.log(
    `Successfully deleted ${idsToDelete.length} items for user ${userId}`,
  );
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
    allIds.forEach((id) => mem.set(id, "0"));

    await retryOperation(() => processUserDeletion(dataBelongUserId, allIds));

    return res.status(200).json({
      message: "Delete request processed",
      processingIds: allIds,
    });
  } catch (error) {
    console.error("Error in handleDelete:", error);
    return res.status(500).json({ error: "An internal server error occurred" });
  }
};
