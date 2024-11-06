import path from "path";
import fs from "fs";
import { getHeadTail } from "core/getHeadTail";
import { baseDir } from "database/server/config";

const readFromFile = (filePath: string): Map<string, string> => {
  const dataMap = new Map<string, string>();

  try {
    const data = fs.readFileSync(filePath, "utf-8");
    const lines = data.split("\n");

    for (const line of lines) {
      if (line.trim()) {
        const { key, value } = getHeadTail(line);
        dataMap.set(key, value);
      }
    }
  } catch (error) {
    console.error(`Error reading file ${filePath}`, error);
  }

  return dataMap;
};

const writeDataToFile = (
  baseDir: string,
  userId: string,
  dataMap: Map<string, string>,
  timestamp: string,
  layer: number = 0,
): void => {
  const userDir = path.join(baseDir, userId);

  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }

  const filePath = path.join(userDir, `data_${timestamp}_layer${layer}.nolo`);
  const lines = Array.from(dataMap.entries()).map(
    ([key, value]) => `${key} ${value}`,
  );

  fs.writeFileSync(filePath, lines.join("\n"), "utf-8");

  mergeLayerFilesIfNeeded(baseDir, userId, layer);
};
//need add test for merge result check
const mergeLayerFilesIfNeeded = (
  baseDir: string,
  userId: string,
  layer: number,
): void => {
  const userDir = path.join(baseDir, userId);

  // 1. 确保文件按从新到旧排序
  const layerFiles = fs
    .readdirSync(userDir)
    .filter((file) => file.endsWith(`_layer${layer}.nolo`))
    .sort((a, b) => {
      // 格式: data_TIMESTAMP_SEQUENCE_layerX.nolo
      const [timestampA, sequenceA] = a.split("_").slice(1, 3);
      const [timestampB, sequenceB] = b.split("_").slice(1, 3);

      if (timestampA !== timestampB) {
        return timestampB.localeCompare(timestampA); // 时间戳降序
      }
      return parseInt(sequenceB) - parseInt(sequenceA); // 序列号降序
    });

  if (layerFiles.length >= 3) {
    const combinedDataMap = new Map<string, string>();
    const filesToMerge = layerFiles.slice(0, 3);

    // 2. 由于已经按时间排序,只保留第一次出现的key的值
    filesToMerge.forEach((file) => {
      const filePath = path.join(userDir, file);
      const fileData = readFromFile(filePath);

      fileData.forEach((value, key) => {
        // 只在key不存在时写入,因为已经是按最新排序,后面的都是旧数据
        if (!combinedDataMap.has(key)) {
          combinedDataMap.set(key, value);
        }
      });

      fs.unlinkSync(filePath);
    });

    const nextLayer = layer + 1;
    const newTimestamp = new Date().toISOString().replace(/[-:.]/g, "");

    setTimeout(() => {
      writeDataToFile(
        baseDir,
        userId,
        combinedDataMap,
        newTimestamp,
        nextLayer,
      );
    }, 100);
  }
};

export const writeUserFiles = (
  userData: Map<string, Map<string, string>>,
  timestamp: string,
  sequenceNumber: number,
): void => {
  try {
    // 写入用户数据
    userData.forEach((dataMap, userId) => {
      writeDataToFile(
        baseDir,
        userId,
        dataMap,
        `${timestamp}_${sequenceNumber}`,
      );
    });

    // 删除WAL日志
    const walPath = path.resolve(
      baseDir,
      `wal_${timestamp}_${sequenceNumber}.log`,
    );
    if (fs.existsSync(walPath)) {
      fs.unlinkSync(walPath);
      console.log(`Successfully deleted WAL file: ${walPath}`);
    }
  } catch (error) {
    console.error("Error in writeUserFiles:", error);
    throw error; // 向上传递错误,让调用者知道写入失败
  }
};
