import { extractUserId } from "core/prefix";
import { isNil } from "rambda";

import { mem } from "./mem";
import { processOldDeletion } from "./deleteFromFile";
import serverDb from "./db";

const checkDeletePermission = (
  actionUserId: string,
  dataBelongUserId: string
): boolean => actionUserId === dataBelongUserId;

const handleUnknownOwner = (id: string, ids: string[]) => {
  const allIds = [id, ...ids];
  allIds.forEach((id) => mem.set(id, "0"));
  return allIds;
};

export const handleDelete = async (req, res) => {
  try {
    const { userId: actionUserId } = req.user;
    const { id } = req.params;
    const { ids = [] } = req.body || {};

    const deleteData = await serverDb.get(id);
    const dataBelongUserId = deleteData ? deleteData.userId : extractUserId(id);

    // 如果找不到所属用户ID，直接处理删除
    if (isNil(dataBelongUserId)) {
      const processedIds = handleUnknownOwner(id, ids);
      return res.status(200).json({
        message: "Delete request processed for unknown owner",
        processingIds: processedIds,
      });
    }

    // 检查权限
    if (!checkDeletePermission(actionUserId, dataBelongUserId)) {
      return res.status(403).json({ error: "Unauthorized action." });
    }
    if (deleteData) {
      await serverDb.del(id);
      return res.status(200).json({
        message: "Delete request processed for unknown owner",
        processingIds: [id],
      });
    }

    const allIds = [id, ...ids];
    allIds.forEach((id) => mem.set(id, "0"));

    processOldDeletion(dataBelongUserId, allIds);
    return res.status(200).json({
      message: "Delete request processed",
      processingIds: allIds,
    });
  } catch (error) {
    console.error("Error in handleDelete:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};
