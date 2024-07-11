import { formatData } from "core/formatData";
import { generateKey } from "core/generateMainKey";
import { nolotusId } from "core/init";
import { DataType } from "create/types";
import { extractUserId } from "core";
import { serverWrite } from "../write/serverWrite";
// import {WriteDataRequestBody} from '../types';

export const handleError = (res, error) => {
  const status = error.message === "Access denied" ? 401 : 500;
  return res.status(status).json({ error: error.message });
};
const allowIds = ["domain-list"];
const allowType = {
  [nolotusId]: [DataType.TokenStatistics],
};
export const handleWrite = async (req, res) => {
  const { user } = req;
  const actionUserId = user.userId;
  if (req.body instanceof FormData) {
    const formData = req.body;
    const fileBlob = formData.get("file");
    const clientGeneratedID = formData.get("id");
    const saveUserId = extractUserId(clientGeneratedID);
    await serverWrite(clientGeneratedID, fileBlob, saveUserId);
    return res.status(200).json({ message: "success", id: clientGeneratedID });
  }

  const { userId, data, flags, customId } = req.body;
  const saveUserId = userId;
  const isWriteSelf = actionUserId === saveUserId;
  const value = formatData(data, flags);

  if (value.includes("\n")) {
    return res.status(400).json({
      message: "Data contains newline character and is not allowed.",
    });
  }
  const id = generateKey(value, saveUserId, flags, customId);

  if (isWriteSelf) {
    try {
      await serverWrite(id, value, saveUserId);
      return res.status(200).json({
        message: "Data written to file successfully.",
        id,
      });
    } catch (error) {
      return handleError(res, error);
    }
  } else {
    const userRule = allowType[saveUserId];
    const isAllowType = userRule?.includes(data.type);
    const isAllowId = allowIds.includes(customId);
    if (isAllowType || isAllowId) {
      await serverWrite(id, value, saveUserId);
      return res.status(200).json({
        message: "Data written to file successfully.",
        id,
      });
    }
    return res.status(403).json({
      message: "操作不被允许.",
    });
  }
};
