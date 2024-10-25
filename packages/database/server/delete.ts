import { extractUserId } from "core/prefix";
import { checkDeletePermission } from "./permissions";
import { mem } from "./mem";
import { processOldDeletion } from "./deleteFromFile";

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

    allIds.forEach((id) => {
      mem.set(id, "0");
    });

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
