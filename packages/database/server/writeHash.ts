import { promises as fs } from "fs";
import { createWriteStream } from "node:fs";
import { dirname } from "path";
import { pipeline, Readable } from "stream";
import { promisify } from "util";

import { formatData } from "core/formatData";
import { generateKey } from "core/generateMainKey";
import { nolotusId } from "core/init";
import { DataType } from "create/types";
// import {WriteDataRequestBody} from '../types';

export const handleError = (res, error) => {
  console.error(error);
  const status = error.message === "Access denied" ? 401 : 500;
  return res.status(status).json({ error: error.message });
};

const pipelineAsync = promisify(pipeline);

const allowType = {
  [nolotusId]: [DataType.TokenStatistics],
};

export const writeDataToHash = async (dataKey, data, userId) => {
  const path = `./nolodata/${userId}/hash.nolo`;
  try {
    await fs.access(dirname(path));
  } catch {
    throw new Error("没有该用户");
  }
  const output = createWriteStream(path, { flags: "a" });
  await pipelineAsync(Readable.from(`${dataKey} ${data}\n`), output);
};

export const handleWriteHash = async (req, res) => {
  const { userId, data, flags, customId } = req.body;
  if (flags.isHash) {
    const { user } = req;
    const actionUserId = user.userId;

    const saveUserId = userId;

    const isWriteSelf = actionUserId === saveUserId;
    const value = formatData(data, flags);

    if (value.includes("\n")) {
      return res.status(400).json({
        message: "Data contains newline character and is not allowed.",
      });
    }
    const dataId = generateKey(value, saveUserId, flags, customId);

    if (isWriteSelf) {
      try {
        await writeDataToHash(dataId, value, saveUserId);
        return res.status(200).json({
          message: "Data written to file successfully.",
          dataId,
        });
      } catch (error) {
        return handleError(res, error);
      }
    } else {
      const userRule = allowType[saveUserId];
      const isAllowType = userRule?.includes(data.type);

      if (isAllowType) {
        await writeDataToHash(dataId, value, saveUserId);
        return res.status(200).json({
          message: "Data written to file successfully.",
          dataId,
        });
      }
      return res.status(403).json({
        message: "操作不被允许.",
      });
    }
  }
  return res.status(403).json({
    message: "操作不被允许.",
  });
};
