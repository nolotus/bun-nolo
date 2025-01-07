// write.ts

import { formatData } from "core/formatData";
import { generateCustomId } from "core/generateMainKey";
import { extractAndDecodePrefix, extractUserId } from "core/prefix";

import { mem } from "./mem";
import { checkPermission, checkUserDirectory } from "./permissions";
import { isV0Id } from "core/id";

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

export const serverWrite = (
  dataKey: string,
  data: string | Blob,
  userId: string
): Promise<void> => {
  if (isV0Id(dataKey)) {
    console.log("write new ", dataKey);
  }
  return checkUserDirectory(userId).then(() => {
    const result = processDataKey(dataKey, data);
    if (!result.isFile) {
      mem.set(dataKey, data as string);
      return Promise.resolve();
    }
    return Promise.resolve();
  });
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

    try {
      await serverWrite(clientGeneratedID, fileBlob, saveUserId);
      return res
        .status(200)
        .json({ message: "success", id: clientGeneratedID });
    } catch (error) {
      return handleError(
        res,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }
  const { userId, data, flags, customId } = req.body;

  const saveUserId = userId;
  if (saveUserId === "local") {
    return res.status(400).json({
      message: "local data is not allowed.",
    });
  }
  const value = formatData(data, flags);

  if (typeof value === "string" && value.includes("\n")) {
    return res.status(400).json({
      message: "Data contains newline character and is not allowed.",
    });
  }

  const id = generateCustomId(saveUserId, customId, flags);

  if (checkPermission(actionUserId, saveUserId, data, customId)) {
    try {
      await serverWrite(id, value, saveUserId);
      return res.status(200).json({
        message: "Data written to file successfully.",
        id,
        ...data,
      });
    } catch (error) {
      return handleError(
        res,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  } else {
    return res.status(403).json({
      message: "操作不被允许.",
    });
  }
};
