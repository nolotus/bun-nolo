import { formatData, extractAndDecodePrefix, extractUserId } from "core";

export const handleError = (res, error) => {
  console.error(error);
  const status = error.message === "Access denied" ? 401 : 500;
  res.status(status).json({ error: error.message });
};

import { updateDataInFile } from "utils/file";
import { serverGetData } from "./read";

const updateServerData = async (actionUserId, id, value: string) => {
  const userId = extractUserId(id);
  const filePath = `./nolodata/${userId}/index.nolo`;
  await updateDataInFile(filePath, id, value);
};
const updateList = async (actionUserId, dataKey, data, res) => {
  try {
    let array = await serverGetData(dataKey);

    if (!Array.isArray(array)) {
      array = [];
    }

    const idsToUpdate = Array.isArray(data.ids) ? data.ids : [data.id];
    if (data.action === "remove") {
      array = array.filter((id) => !idsToUpdate.includes(id));
    } else {
      idsToUpdate.forEach((id) => {
        if (!array.includes(id)) {
          array.push(id);
        }
      });
    }
    const value = formatData(array, { isList: true });
    await updateServerData(actionUserId, dataKey, value);

    return res
      .status(200)
      .json({ array, message: "Data updated successfully." });
  } catch (error) {
    console.error("Error updating list:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
//更新数据
// 更新普通json 以及其他数据
//更新list数据
export const handleUpdate = async (req, res) => {
  const { user } = req;
  const acitonUserId = user.userId;
  let id = req.params.id;
  const data = req.body;
  const flags = extractAndDecodePrefix(id);

  const { isList, isHash, isFile } = flags;
  //如果是isHash  isFile 则不允许更新
  if (isList) {
    return updateList(acitonUserId, id, data, res);
  } else {
    try {
      const value = formatData(data, flags);
      await updateServerData(acitonUserId, id, value);
      return res
        .status(200)
        .json({ data: { id, ...data }, message: "Data updated successfully." });
    } catch (error) {
      handleError(res, error);
    }
  }
};
