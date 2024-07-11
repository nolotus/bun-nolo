import { extractUserId } from "core/prefix";
import { removeDataFromFile } from "utils/file";

const deleteData = async (userId: string, ids: string[]) => {
  const indexPath = `./nolodata/${userId}/index.nolo`;
  const hashPath = `./nolodata/${userId}/hash.nolo`;
  await Promise.all([
    removeDataFromFile(indexPath, ids),
    removeDataFromFile(hashPath, ids),
  ]);
};

const validateUserAction = (actionUserId: string, dataBelongUserId: string) => {
  if (actionUserId !== dataBelongUserId) {
    throw new Error("Unauthorized action.");
  }
};

const handleIdsDeletion = async (userId: string, ids: string[]) => {
  if (ids && ids.length > 0) {
    await deleteData(userId, ids);
  }
};
export const handleDelete = async (req, res) => {
  const { userId: actionUserId } = req.user;
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "ID parameter is missing." });
  }
  const dataBelongUserId = extractUserId(id);
  validateUserAction(actionUserId, dataBelongUserId);

  const { ids } = req.body || {};
  await handleIdsDeletion(dataBelongUserId, ids);
  try {
    // 删除单个数据
    await deleteData(dataBelongUserId, [id]);
    return res.status(200).json({ message: "Data deleted successfully.", id });
  } catch (error) {
    console.error(error);
    const status = error.message === "Access denied" ? 401 : 500;
    return res.status(status).json({ error: error.message });
  }
};
