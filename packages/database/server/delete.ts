import { extractUserId } from "core/prefix";
import { removeDataFromFile } from "utils/file";

const deleteData = async (userId: string, ids) => {
  const indexPath = `./nolodata/${userId}/index.nolo`;
  const hashPath = `./nolodata/${userId}/hash.nolo`;
  await removeDataFromFile(indexPath, ids);
  await removeDataFromFile(hashPath, ids);
};

export const handleDelete = async (req, res) => {
  const { userId: actionUserId } = req.user;
  const { id } = req.params;

  const userId = extractUserId(id);
  const isSelfData = actionUserId === userId;
  if (!isSelfData) {
    throw new Error("Unauthorized action.");
  }

  const { ids } = req.body || {};
  if (ids) {
    console.log("ids", ids);
    //maybe ids not belong userID database
    //meybe need check belongs
    await deleteData(userId, ids);
  }
  try {
    await deleteData(userId, [id]);
    return res.status(200).json({ message: "Data deleted successfully.", id });
  } catch (error) {
    console.error(error);
    const status = error.message === "Access denied" ? 401 : 500;
    return res.status(status).json({ error: error.message });
  }
};
