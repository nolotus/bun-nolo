import { formatData, extractAndDecodePrefix, extractUserId } from "core";

export const handleError = (res, error) => {
  console.error(error);
  const status = error.message === "Access denied" ? 401 : 500;
  res.status(status).json({ error: error.message });
};

import {
  appendDataToFile,
  checkFileExists,
  findDataInFile,
  updateDataInFile,
} from "utils/file";

const updateData = async (actionUserId, id, value) => {
  const userId = extractUserId(id);
  const filePath = `./nolodata/${userId}/index.nolo`;
  await updateDataInFile(filePath, id, value);
  // const writer = Bun.file(tempFilePath).writer({ flags: "w" });
  // try {
  //   let updated = false;
  //   const fileStream = Bun.file(IndexPath).stream();
  //   for await (const line of readLines(fileStream)) {
  //     if (line.startsWith(id)) {
  //       await writer.write(`${id} ${value}\n`);
  //       updated = true;
  //     } else {
  //       await writer.write(`${line}\n`);
  //     }
  //   }

  //   await writer.end();

  //   if (updated) {
  //     await unlink(IndexPath);
  //     await Bun.write(IndexPath, Bun.file(tempFilePath));
  //     await unlink(tempFilePath);
  //   } else {
  //     await unlink(tempFilePath);
  //     throw new Error("Data not found");
  //   }
  // } catch (error) {
  //   await unlink(tempFilePath);
  //   throw error;
  // }
};
const updateList = async (acitonUserId, dataKey, data) => {
  const userId = extractUserId(dataKey);
  const ListPath = `./nolodata/${userId}/list.nolo`;
  const isListDirExist = checkFileExists(ListPath);
  if (isListDirExist) {
    let array = await findDataInFile(ListPath, dataKey);
    if (array) {
      //merge exist
      if (!array.includes(data.id)) {
        array.push(data.id);
      }
      const value = formatData(array, { isList: true });
      await updateDataInFile(ListPath, dataKey, value);
    } else {
      const value = formatData([data.id], { isList: true });
      appendDataToFile(ListPath, dataKey, value);
    }
  } else {
    const value = formatData([data.id], { isList: true });
    await Bun.write(ListPath, `${dataKey} ${value}\n`);
  }
};
export const handleUpdate = async (req, res) => {
  const { user } = req;
  const acitonUserId = user.userId;
  let id = req.params.id;
  const data = req.body;
  const flags = extractAndDecodePrefix(id);

  const { isList, isHash, isFile } = flags;
  //如果是isHash  isFile 则不允许更新
  if (isList) {
    updateList(acitonUserId, id, data);
  } else {
    try {
      const value = formatData(data, flags);
      await updateData(acitonUserId, id, value);
      return res
        .status(200)
        .json({ data: { id, ...data }, message: "Data updated successfully." });
    } catch (error) {
      handleError(res, error);
    }
  }
};
