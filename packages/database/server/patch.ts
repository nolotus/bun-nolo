import { extractAndDecodePrefix } from "core/prefix";

import { mem } from "./mem";
import { serverGetData } from "./read";
import serverDb from "./db";
// nomore need patch old db

function listToTrans(arr) {
  // 将数组中的每个元素转换成字符串
  // 对于包含逗号或双引号的元素，将其包裹在双引号中，并将内部的双引号替换成两个双引号
  return arr
    .map((item) => {
      if (item.includes(",") || item.includes('"')) {
        return `"${item.replace(/"/g, '""')}"`;
      }
      return item;
    })
    .join(",");
}

const formatData = (data: any, flags): string => {
  let formattedData = data;
  if (flags?.isList) {
    formattedData = listToTrans(data);
  } else {
    formattedData = JSON.stringify(data);
  }

  return formattedData;
};

export const handlePatch = async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  const changes = body;
  const { user } = req;
  const actionUserId = user.userId;
  //need check patch permission

  const newDbExist = await serverDb.get(id);

  let data;
  if (newDbExist) {
    const final = { ...newDbExist, ...changes };
    serverDb.put(id, final);
  } else {
    const result = await serverGetData(id);
    data = { ...result, ...changes };
    const flags = extractAndDecodePrefix(id);
    const value = formatData(data, flags);
    mem.set(id, value);
  }

  return res
    .status(200)
    .json({ data: { id, ...data }, message: "Data patched successfully." });
};
