import { getHeadTail, extractAndDecodePrefix } from "core";
import { readLines } from "utils/bun/readLines";
import { parseStrWithId } from "core/decodeData";
import { baseDir } from "database/server/config";
import path from "path";
import { mem } from "../server/mem";
import { getDatabaseFilePath } from "../init";
import { QueryCondition, QueryOptions } from "./types";
import { handleListData } from "./handleLine/handleListData";
import { handleJSONData } from "./handleLine/handleJSONData";
import { handleObjectData } from "./handleLine/handleObject";
import { getSortedFilteredFiles } from "../server/sort";

const checkMemoryForData = (id: string) => {
  const memValue = mem.getFromMemorySync(id);
  if (memValue === "0") {
    return null; // 视为已删除
  }
  if (memValue) {
    const result = parseStrWithId(id, memValue);
    return result;
  }
  return undefined; // 表示内存中没有找到数据
};

const handleData = (
  data: string,
  condition: QueryCondition,
  flags: any,
  isObject: boolean,
  isJSON: boolean,
  isList: boolean,
) => {
  if (flags.isList && isList) {
    return handleListData(data, condition);
  }
  if (flags.isJSON && isJSON) {
    return handleJSONData(data, condition);
  }
  if (flags.isObject && isObject) {
    return handleObjectData(data, condition);
  }
  return null;
};

async function createDataStream(path: string) {
  const file = Bun.file(path);
  return file.stream();
}

function sortResults(results, sort) {
  if (sort) {
    results.sort((a, b) => {
      if (sort.order === "asc") {
        return a[sort.key] > b[sort.key] ? 1 : -1;
      }
      return a[sort.key] < b[sort.key] ? 1 : -1;
    });
  }
}

function processLine(line, condition, isObject, isJSON, isList) {
  const { key: dataKey, value: data } = getHeadTail(line);
  const flags = extractAndDecodePrefix(dataKey);

  const result = handleData(
    data,
    condition || {},
    flags,
    isObject,
    isJSON,
    isList,
  );

  // 创建返回值
  const returnValue = result !== null ? { id: dataKey, ...result } : 0;

  // 特定 ID
  const targetId =
    "000000100000-UWJFNG1GZUwzLVMzaWhjTzdnWmdrLVJ6d1d6Rm9FTnhYRUNXeFgyc3h6VQ-01JAZGP4PESK3VCEKY9N6P25HD";
  if (dataKey === targetId) {
    // 输出返回值及其类型
  }

  return returnValue;
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

  try {
    const { indexPath } = getDatabaseFilePath(userId);

    const userDir = path.join(baseDir, userId);
    const sortedFilteredFiles = getSortedFilteredFiles(userDir, false);

    const paths = [
      indexPath,
      ...sortedFilteredFiles.map((file) => path.join(userDir, file)),
    ];

    const resultsMap: { [key: string]: any } = {};

    for (const path of paths) {
      const stream = await createDataStream(path);
      const reader = readLines(stream);

      for await (const line of reader) {
        const resultWithKey = processLine(
          line,
          condition,
          isObject,
          isJSON,
          isList,
        );

        if (typeof resultWithKey === "number" && resultWithKey === 0) {
          const targetId = line.split(" ")[0]; // 假设 id 是行的第一个部分
          if (resultsMap[targetId]) {
            delete resultsMap[targetId];
          }
          continue;
        }

        if (resultWithKey) {
          const memResult = checkMemoryForData(resultWithKey.id);

          // 将内存数据与文件数据结合，以内存为准（假设内存为最新）
          const finalResult =
            memResult !== undefined
              ? { id: resultWithKey.id, ...memResult }
              : resultWithKey;

          resultsMap[resultWithKey.id] = finalResult;
        }
      }
    }

    const allResults = Object.values(resultsMap);
    sortResults(allResults, sort);

    const paginatedResults = allResults.slice(skip, skip + limit);

    return paginatedResults;
  } catch (e) {
    console.error("Error in queryData:", e);
    return [];
  }
};
