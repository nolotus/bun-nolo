// write.ts

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

export const handleWrite = async (req: any, res: any) => {
  const { user } = req;
  const actionUserId = user.userId;

  const { userId, data, customId } = req.body;
  const saveUserId = userId;

  if (saveUserId === "local") {
    console.log("local write");
    return res.status(400).json({
      message: "local data is not allowed.",
    });
  }
  // category
  // workspace?
  if (
    data.type === DataType.MSG ||
    data.type === DataType.PAGE ||
    data.type === DataType.CYBOT ||
    data.type === DataType.DIALOG
  ) {
    const hasUser = await serverDb.get(`user:${actionUserId}`);
    const hasV0User = await doesUserDirectoryExist(actionUserId);
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
  } else {
    return res.status(403).json({
      message: "操作不被允许.",
    });
  }
};
