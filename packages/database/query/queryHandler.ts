import { noloToObject, getHeadTail, extractAndDecodePrefix } from "core";
import { readLines } from "utils/bun/readLines";

import { QueryCondition, QueryOptions } from "./types";
import { checkQuery, QueryConditions } from "./checkQuery";
import { getDatabaseFilePath } from "../init";
import { listToArray } from "core/noloToOther";
import { isIdInDeleteQueueCache } from "database/server/cache";

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

// 创建数据流函数
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
      if (isLimitReached) break; // 如果已达到limit，中断循环

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
          if (isIdInDeleteQueueCache(userId, resultWithKey.id)) {
            continue; // 如果在缓存中，跳过这条数据
          }

          if (count >= skip && results.length < limit) {
            results.push(resultWithKey);
          }
          count++;

          // 如果达到limit，不再进行处理
          if (results.length >= limit) {
            isLimitReached = true;
            break;
          }
        }
      }
    }

    // 只在最后对所有结果进行排序
    sortResults(results, sort);
    return results;
  } catch (e) {}
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
