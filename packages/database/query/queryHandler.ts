import { extractAndDecodePrefix } from "core/prefix";
import { getHeadTail } from "core/getHeadTail";

import { readLines } from "utils/bun/readLines";
import { baseDir } from "database/server/config";
import path from "path";
import { QueryOptions } from "./types";
import { getSortedFilteredFiles } from "../server/sort";
import { checkQuery } from "./checkQuery";
import { sortBy, prop } from "rambda"; // 使用 rambda 的排序方法

async function createDataStream(path: string) {
  try {
    const file = Bun.file(path);
    return file.stream();
  } catch (error) {
    console.error(`Error creating data stream for ${path}:`, error);
    throw error; // 或者根据需要处理错误
  }
}

async function* fileDataGenerator(paths) {
  for (const filePath of paths) {
    const stream = await createDataStream(filePath);
    const reader = readLines(stream);

    try {
      for await (const line of reader) {
        yield line;
      }
    } catch (error) {}
  }
}

function sortResults(results, sort) {
  if (sort) {
    results =
      sort.order === "asc"
        ? sortBy(prop(sort.key), results)
        : sortBy(prop(sort.key), results).reverse();
  }
  return results;
}

export const queryData = async (options: QueryOptions): Promise<Array<any>> => {
  const { userId, condition, isJSON = false, limit = 10, sort } = options;

  let resultsArray = [];
  const addToResults = (key, item) => {
    if (!resultsArray.includes(key)) {
      resultsArray.push(item);
    }
  };
  const deletedData = new Set();

  const userDir = path.join(baseDir, userId);
  const sortedFilteredFiles = getSortedFilteredFiles(userDir);
  const paths = [
    ...sortedFilteredFiles.map((file) => path.join(userDir, file)),
  ];
  // console.log("paths", paths);

  const dataGenerator = fileDataGenerator(paths);

  for await (const line of dataGenerator) {
    if (resultsArray.length >= limit) break;

    const { key, value } = getHeadTail(line);

    const flags = extractAndDecodePrefix(key);

    if (value === "0") {
      if (!deletedData.has(key)) {
        deletedData.add(key);
      }
      continue;
    }

    if (deletedData.has(key)) continue;

    if (isJSON && flags.isJSON) {
      try {
        const jsonData = JSON.parse(value);

        if (checkQuery(jsonData, condition)) {
          const result = { id: key, ...jsonData };
          if (!deletedData.has(key)) {
            addToResults(key, result);
          }
        }
      } catch (error) {
        // console.error(`Error parsing JSON for key ${key}:`, error);
        // 继续处理下一个数据
      }
    }
  }

  return sortResults(resultsArray, sort);
};
