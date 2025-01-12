import { extractUserId } from "core/prefix";
import { isNil } from "rambda";

import { mem } from "./mem";
import serverDb from "./db";

const checkDeletePermission = (
  actionUserId: string,
  dataBelongUserId: string
): boolean => actionUserId === dataBelongUserId;

export const handleDelete = async (req, res) => {
  try {
    const { userId: actionUserId } = req.user;
    const { id } = req.params;

    const willDeleteData = await serverDb.get(id);
    const dataBelongUserId = willDeleteData
      ? willDeleteData.userId
      : extractUserId(id);

    // 如果找不到所属用户ID，直接处理删除
    if (isNil(dataBelongUserId)) {
      mem.set(id, "0");
      serverDb.del(id);
      return res.status(200).json({
        message: "Delete request processed for unknown owner",
        processingIds: [id],
      });
    }

    // 检查权限
    if (!checkDeletePermission(actionUserId, dataBelongUserId)) {
      return res.status(403).json({ error: "Unauthorized action." });
    }
    if (willDeleteData) {
      await serverDb.del(id);
      return res.status(200).json({
        message: "Delete request processed for unknown owner",
        processingIds: [id],
      });
    }

    mem.set(id, "0");
    return res.status(200).json({
      message: "Delete request processed",
      processingIds: [id],
    });
  } catch (error) {
    console.error("Error in handleDelete:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};
