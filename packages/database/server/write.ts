// write.ts

import { formatData } from "core/formatData";
import { generateIdWithCustomId } from "core/generateMainKey";

import { mem } from "./mem";
import { checkPermission, checkUserDirectory } from "./permissions";
import { DataType } from "create/types";
import serverDb from "./db";
import { ulid } from "ulid";

export const serverWrite = (
  dataKey: string,
  data: string | Blob,
  userId: string
): Promise<void> => {
  console.log("userId", userId);

  if (userId.length < 12) {
    console.log("server write userId", userId);

    // serverDb.put();
  }
  return checkUserDirectory(userId).then(() => {
    mem.set(dataKey, data as string);
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

  const { userId, data, flags, customId } = req.body;
  console.log("data", data);
  if (
    data.type === DataType.Dialog ||
    data.type === DataType.Cybot ||
    data.type === DataType.Page
  ) {
    const hasUser = await serverDb.get(`user:${userId}`);
    // const hasV0User = await checkUserDirectory(userId);
    console.log("hasUser", hasUser);
    const id: string = `${data.type}-${userId}-${ulid()}`;
    await serverDb.put(id, data);

    const returnJson = {
      message: "Data written to file successfully.",
      id,
      ...data,
    };
    return res.status(200).json(returnJson);
  }
  const saveUserId = userId;

  if (saveUserId === "local") {
    console.log("local write");
    return res.status(400).json({
      message: "local data is not allowed.",
    });
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
