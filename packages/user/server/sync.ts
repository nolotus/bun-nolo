import fs, { promises as fsPromises } from "fs";
import path from "path";

import { DATABASE_DIR, DEFAULT_INDEX_FILE } from "database/init";
import { extractAndDecodePrefix } from "core";
import { formatData } from "core/formatData";

const syncUserData = async (userId, data) => {
  const userDirPath = path.join(DATABASE_DIR, userId);
  console.log("syncUserData 1");

  // 检查文件夹是否存在
  try {
    await fsPromises.access(userDirPath);
  } catch {
    console.log("syncUserData 2");
    // 文件夹不存在，创建文件夹并写入数据
    fs.mkdirSync(userDirPath, { recursive: true });
    const filePath = path.join(userDirPath, DEFAULT_INDEX_FILE);
    console.log("syncUserData 3", data);

    fs.writeFileSync(filePath, JSON.stringify(data));
    // chang to  line
    const writable = fs.createWriteStream(filePath, {
      encoding: "utf8",
      flags: "w", // 'w' 表示写模式
    });
    for (const item of data) {
      const flags = extractAndDecodePrefix(item.key);
      //todo remove .value
      const formattedValue = formatData(item.value, flags);
      const line = `${item.key} ${formattedValue}\n`; // key 和 formattedData 之间用空格分隔，然后换行
      writable.write(line);
    }

    writable.end();
    return;
  }
  console.log("syncUserData 4");

  // 文件夹已存在
  const filePath = path.join(userDirPath, DEFAULT_INDEX_FILE);
  const existingData = JSON.parse(fs.readFileSync(filePath, "utf8"));

  // 对于 hash 数据，直接使用现有数据
  if (existingData.hash) {
    // TODO: Use existing hash data
  }

  // 对于 version 数据，进行合并
  if (existingData.version && data.version) {
    const mergedVersionData = mergeVersionData(
      existingData.version,
      data.version,
    );
    existingData.version = mergedVersionData;
    // TODO: Merged version data
  }

  // 其他数据暂未考虑
  // TODO: Handle other types of data
};

export async function handleSyncRequest(req, res) {
  try {
    const idDataMap = req.body.idDataMap;

    // 验证 idDataMap 是否存在和是否是一个对象
    if (!idDataMap || typeof idDataMap !== "object") {
      return res.status(400).json({ message: "Invalid idDataMap format" });
    }
    // 遍历 idDataMap 对象，并对每个 id 和其对应的数据调用 syncUserData 函数
    for (const [id, data] of Object.entries(idDataMap)) {
      await syncUserData(id, data);
    }
    console.log("2");

    return res.status(200).json({ message: "Data synced successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "An error occurred while syncing data", error });
  }
}

// 假设这是一个用于合并版本数据的函数
const mergeVersionData = (existingData, newData) => {
  // 合并逻辑
  return { ...existingData, ...newData };
};
