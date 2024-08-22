// write.ts

import { formatData } from "core/formatData";
import { generateKey } from "core/generateMainKey";
import { extractAndDecodePrefix, extractUserId } from "core/prefix";
import { promises as fs } from "fs";
import { dirname } from "path";
import { pipeline, Readable } from "stream";
import { promisify } from "util";
import { createWriteStream } from "node:fs";

import { withUserLock } from "./userLock";
import { mem } from "./mem";
import { checkPermission } from "./permissions";

const pipelineAsync = promisify(pipeline);

async function checkUserDirectory(userId: string): Promise<void> {
  const path = `./nolodata/${userId}/index.nolo`;
  try {
    await fs.access(dirname(path));
  } catch {
    throw new Error("没有该用户");
  }
}

async function processFile(dataKey: string, data: Blob): Promise<void> {
  const mimeTypes: { [key: string]: string } = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "application/pdf": ".pdf",
  };
  const fileExtension = mimeTypes[data.type] || "";
  const userId = extractUserId(dataKey);
  await Bun.write(`nolodata/${userId}/${dataKey}${fileExtension}`, data);
}

function processDataKey(dataKey: string, data: any): { isFile: boolean } {
  const result = extractAndDecodePrefix(dataKey);
  const isFile = result.isFile || false;
  if (isFile) {
    processFile(dataKey, data);
  }
  return { isFile };
}

async function appendDataToIndex(
  userId: string,
  dataKey: string,
  data: string | Blob,
): Promise<void> {
  const path = `./nolodata/${userId}/index.nolo`;
  const output = createWriteStream(path, { flags: "a" });
  await pipelineAsync(Readable.from(`${dataKey} ${data}\n`), output);
}

const serverWrite = async (
  dataKey: string,
  data: string | Blob,
  userId: string,
): Promise<void> => {
  await checkUserDirectory(userId);
  const result = processDataKey(dataKey, data);
  if (!result.isFile) {
    mem.set(dataKey, data);
    await appendDataToIndex(userId, dataKey, data);
  }
};

export const handleError = (res: any, error: Error) => {
  const status = error.message === "Access denied" ? 401 : 500;
  return res.status(status).json({ error: error.message });
};

export const handleWrite = async (req: any, res: any) => {
  const { user } = req;
  const actionUserId = user.userId;

  if (req.body instanceof FormData) {
    const formData = req.body;
    const fileBlob = formData.get("file") as Blob;
    const clientGeneratedID = formData.get("id") as string;
    const saveUserId = extractUserId(clientGeneratedID);

    return await withUserLock(saveUserId, async () => {
      await serverWrite(clientGeneratedID, fileBlob, saveUserId);
      return res
        .status(200)
        .json({ message: "success", id: clientGeneratedID });
    });
  }

  const { userId, data, flags, customId } = req.body;
  const saveUserId = userId;
  const value = formatData(data, flags);

  if (typeof value === "string" && value.includes("\n")) {
    return res.status(400).json({
      message: "Data contains newline character and is not allowed.",
    });
  }

  const id = generateKey(value, saveUserId, flags, customId);

  return await withUserLock(saveUserId, async () => {
    if (checkPermission(actionUserId, saveUserId, data, customId)) {
      try {
        await serverWrite(id, value, saveUserId);
        return res.status(200).json({
          message: "Data written to file successfully.",
          id,
        });
      } catch (error) {
        return handleError(
          res,
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    } else {
      return res.status(403).json({
        message: "操作不被允许.",
      });
    }
  });
};
