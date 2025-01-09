// write.ts

import { formatData } from "core/formatData";
import { generateIdWithCustomId } from "core/generateMainKey";

import { mem } from "./mem";
import { checkPermission, doesUserDirectoryExist } from "./permissions";
import { DataType } from "create/types";
import serverDb from "./db";

const serverWrite = async (
  dataKey: string,
  data: string | Blob,
  userId: string
): Promise<void> => {
  console.log("userId", userId);
  const isExist = await doesUserDirectoryExist(userId);
  if (isExist) {
    mem.set(dataKey, data as string);
    return Promise.resolve();
  }
};

export const handleError = (res: any, error: Error) => {
  const status = error.message === "Access denied" ? 401 : 500;
  return res.status(status).json({ error: error.message });
};

export const handleWrite = async (req: any, res: any) => {
  const { user } = req;
  const actionUserId = user.userId;

  const { userId, data, flags, customId } = req.body;
  const saveUserId = userId;

  if (saveUserId === "local") {
    console.log("local write");
    return res.status(400).json({
      message: "local data is not allowed.",
    });
  }
  console.log("data", data);
  if (
    data.type === DataType.MSG ||
    data.type === DataType.PAGE ||
    data.type === DataType.CYBOT ||
    data.type === DataType.DIALOG
  ) {
    const hasUser = await serverDb.get(`user:${actionUserId}`);
    const hasV0User = await doesUserDirectoryExist(userId);
    const userExist = hasUser || hasV0User;
    const id = customId;

    if (userExist) {
      await serverDb.put(id, data);
      const returnJson = {
        message: "Data written to file successfully.",
        id,
        ...data,
      };
      return res.status(200).json(returnJson);
    }
  }

  //todo  maybe not need
  // here is need flags

  if (checkPermission(actionUserId, saveUserId, data, customId)) {
    if (flags) {
      const value = formatData(data, flags);
      function generateCustomId(userId: string, customId: string, flags) {
        return generateIdWithCustomId(
          userId,
          customId,
          flags ? flags : { isJSON: true }
        );
      }
      const id = generateCustomId(saveUserId, customId, flags);
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
      console.log("not flags");
    }
  } else {
    return res.status(403).json({
      message: "操作不被允许.",
    });
  }
};
