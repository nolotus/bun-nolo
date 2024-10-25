import path from "path";
import fs from "fs";
import { getHeadTail } from "core";

const getHighestLayer = (userDir: string): number => {
  const files = fs.readdirSync(userDir);
  let highestLayer = 0;

  files.forEach((file) => {
    const match = file.match(/_layer(\d+)\.nolo$/);
    if (match) {
      const layer = Number(match[1]);
      if (layer > highestLayer) {
        highestLayer = layer;
      }
    }
  });

  return highestLayer;
};

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
const mergeLayerFilesIfNeeded = (
  baseDir: string,
  userId: string,
  layer: number,
): void => {
  const userDir = path.join(baseDir, userId);

  const layerFiles = fs
    .readdirSync(userDir)
    .filter((file) => file.endsWith(`_layer${layer}.nolo`));

  if (layerFiles.length >= 3) {
    const combinedDataMap = new Map<string, string>();

    layerFiles.forEach((file) => {
      const filePath = path.join(userDir, file);
      const fileData = readFromFile(filePath);

      fileData.forEach((value, key) => {
        combinedDataMap.set(key, value);
      });

      fs.unlinkSync(filePath);
    });

    const highestLayer = getHighestLayer(userDir);
    if (layer === highestLayer) {
      combinedDataMap.forEach((value, key) => {
        console.log("value", typeof value);
        if (value === "0" || value === 0) {
          combinedDataMap.delete(key);
        }
      });
    }

    const nextLayer = layer + 1;
    const newTimestamp = new Date().toISOString().replace(/[-:.]/g, "");

    writeDataToFile(baseDir, userId, combinedDataMap, newTimestamp, nextLayer);
  }
};
export const writeDataToFile = (
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
