import { noloToObject, getHeadTail, extractAndDecodePrefix } from "core";
import { readLines } from "utils/bun/readLines";
import { QueryCondition, QueryOptions } from "./types";
import { checkQuery, QueryConditions } from "./checkQuery";
import { getDatabaseFilePath } from "../init";
import { listToArray } from "core/noloToOther";
import { isIdInDeleteQueueCache } from "database/server/cache";
import { checkMemoryForData } from "database/server/mem";

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
  return result ? { id: dataKey, ...result } : null;
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
    const { indexPath, hashPath } = getDatabaseFilePath(userId);
    const paths = [indexPath, hashPath];

    const results: any[] = [];
    let count = 0;
    let isLimitReached = false;

    for (const path of paths) {
      if (isLimitReached) break;

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

        if (resultWithKey) {
          // 检查内存中的数据状态
          const memResult = checkMemoryForData(resultWithKey.id);

          // 如果内存中标记为删除（值为0）或在删除队列缓存中，跳过这条数据
          if (
            memResult === null ||
            isIdInDeleteQueueCache(userId, resultWithKey.id)
          ) {
            continue;
          }

          if (count >= skip && results.length < limit) {
            // 如果内存中有非0的值，使用内存中的数据
            results.push(memResult !== undefined ? memResult : resultWithKey);
          }
          count++;

          if (results.length >= limit) {
            isLimitReached = true;
            break;
          }
        }
      }
    }

    sortResults(results, sort);
    return results;
  } catch (e) {
    console.error("Error in queryData:", e);
    return [];
  }
};

function handleObjectData(data: string, condition: QueryConditions) {
  const objectData = noloToObject(data);
  if (checkQuery(objectData, condition)) {
    return objectData;
  }
  return null;
}

function handleJSONData(data: string, condition: QueryConditions) {
  try {
    const jsonData = JSON.parse(data);
    if (checkQuery(jsonData, condition)) {
      return jsonData;
    }
  } catch (error) {}
  return null;
}

function handleListData(data: string, condition: QueryCondition) {
  return listToArray(data);
}
