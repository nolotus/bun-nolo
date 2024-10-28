import { getHeadTail, extractAndDecodePrefix } from "core";
import { readLines } from "utils/bun/readLines";
import { baseDir } from "database/server/config";
import path from "path";
import { mem } from "../server/mem";
import { getDatabaseFilePath } from "../init";
import { QueryCondition, QueryOptions } from "./types";
import { getSortedFilteredFiles } from "../server/sort";
import { checkQuery } from "./checkQuery";
import { listToArray, noloToObject } from "core/noloToOther";
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
  const {
    userId,
    condition,
    isObject = false,
    isJSON = false,
    isList = false,
    skip = 0,
    limit = 10,
    sort,
  } = options;

  const memoryData = mem.getFromMemorySync();

  let resultsArray = [];
  const deletedData = new Set();

  // 提取删除的数据
  for (const { key, value } of memoryData) {
    if (value === "0" && !deletedData.has(key)) {
      deletedData.add(key);
    }
  }

  const { indexPath } = getDatabaseFilePath(userId);
  const userDir = path.join(baseDir, userId);
  const sortedFilteredFiles = getSortedFilteredFiles(userDir);
  const paths = [
    ...sortedFilteredFiles.map((file) => path.join(userDir, file)),
    indexPath,
  ];

  async function* fileDataGenerator(paths) {
    console.log("userId", userId);
    console.log("resultsArray", resultsArray);

    for (const filePath of paths) {
      console.log("filePath", filePath);

      const stream = await createDataStream(filePath);
      const reader = readLines(stream);

      try {
        for await (const line of reader) {
          if (
            line.includes(
              "000000100000-VzlmQmd5S1RBUlphQS1YUnEzalk5MmVnbldoQWNLS0VkbHdQc0kzNmJlYw-01JB8P5JDGNG40N39224TEZMVT",
            )
          ) {
            console.log("line", line);
          }
          yield line;
        }
      } catch (error) {
        console.error("Error reading file:", error);
      }
    }
  }

  const dataGenerator = fileDataGenerator(paths);

  for await (const line of dataGenerator) {
    if (resultsArray.length >= limit) break;

    const { key, value } = getHeadTail(line);

    const flags = extractAndDecodePrefix(key);

    // 新增逻辑，处理文件中的删除标记
    if (value === "0") {
      if (!deletedData.has(key)) {
        deletedData.add(key);
      }
      continue;
    }

    if (deletedData.has(key)) continue;

    if (isList && flags.isList) {
      const result = listToArray(value);
      resultsArray.push(result);
    } else if (isJSON && flags.isJSON) {
      try {
        const jsonData = JSON.parse(value);

        if (checkQuery(jsonData, condition)) {
          const result = { id: key, ...jsonData };
          resultsArray.push(result);
        }
      } catch (error) {
        // console.error(`Error parsing JSON for key ${key}:`, error);
        // 继续处理下一个数据
      }
    } else if (isObject && flags.isObject) {
      const result = noloToObject(value);
      if (checkQuery(result, condition)) {
        resultsArray.push(result);
      }
    }
  }
  console.log("resultsArray", resultsArray);
  return sortResults(resultsArray, sort);
};
