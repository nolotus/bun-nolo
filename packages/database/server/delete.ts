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

  const dataBelongUserId = extractUserId(id);
  const isSelfData = actionUserId === dataBelongUserId;
  if (!isSelfData) {
    console.log("req", req);
    console.log("id", id);
    console.log("actionUserId", actionUserId);
    console.log("dataBelongUserId", dataBelongUserId);
    throw new Error("Unauthorized action.");
  }

  const { ids } = req.body || {};
  if (ids) {
    console.log("ids", ids);
    //maybe ids not belong userID database
    //meybe need check belongs
    await deleteData(dataBelongUserId, ids);
  }
  try {
    await deleteData(dataBelongUserId, [id]);
    return res.status(200).json({ message: "Data deleted successfully.", id });
  } catch (error) {
    console.error(error);
    const status = error.message === "Access denied" ? 401 : 500;
    return res.status(status).json({ error: error.message });
  }
};
