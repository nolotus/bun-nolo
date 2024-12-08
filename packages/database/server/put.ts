import { formatData, extractAndDecodePrefix } from "core";
import { mem } from "./mem";

export const handleError = (res, error) => {
  const status = error.message === "Access denied" ? 401 : 500;
  res.status(status).json({ error: error.message });
};
import { serverGetData } from "./read";

// allow update not exist array
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
    mem.set(dataKey, value);

    return res
      .status(200)
      .json({ array, message: "Data updated successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
//更新数据
// 更新普通json 以及其他数据
//更新list数据
export const handlePut = async (req, res) => {
  const { user } = req;
  const actionUserId = user.userId;
  //need check permission
  let id = req.params.id;
  const data = req.body;
  const flags = extractAndDecodePrefix(id);

  const { isList, isHash, isFile } = flags;
  //如果是isHash  isFile 则不允许更新
  if (isList) {
    return updateList(actionUserId, id, data, res);
  } else {
    try {
      //maybe merge
      if (id.includes("01JEG03TSK60YT06CBK822ZRH9")) {
        console.log("id", id);

        console.log("data", data);
      }
      const value = formatData(data, flags);
      mem.set(id, value);
      return res
        .status(200)
        .json({ data: { id, ...data }, message: "Data updated successfully." });
    } catch (error) {
      handleError(res, error);
    }
  }
};
