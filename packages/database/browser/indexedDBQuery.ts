// indexedDBQuery.ts
import jsonLogic from "json-logic-js";
import { dbOperation } from "./indexedDBActions"; // 假设你的操作函数在另一个文件中

// 查询 IndexedDB 中所有数据的函数
export function queryFromIndexedDB(userId: string): Promise<any[]> {
  return dbOperation(userId, (store) => {
    return new Promise((resolve, reject) => {
      const getAllRequest = store.getAll();

      getAllRequest.onerror = function (event) {
        reject("Error querying data from IndexedDB: " + event.target.error);
      };

      getAllRequest.onsuccess = function (event) {
        resolve(getAllRequest.result);
      };
    });
  });
}

// 定义 options 接口
interface QueryOptions {
  jsonLogicRules: any; // 假设 json-logic-js 使用的是 any 类型
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// 查询 IndexedDB 中符合特定条件的数据的函数
export function queryFilteredFromIndexedDB(
  userId: string,
  options: QueryOptions,
): Promise<any[]> {
  const {
    jsonLogicRules,
    limit = Infinity,
    sortBy,
    sortOrder = "asc",
  } = options;

  return dbOperation(userId, (store) => {
    return new Promise((resolve, reject) => {
      const filteredResults: any[] = [];

      // 使用游标来遍历数据
      const cursorRequest = store.openCursor();
      cursorRequest.onerror = function (event) {
        reject(
          "Error querying filtered data from IndexedDB: " + event.target.error,
        );
      };

      cursorRequest.onsuccess = function (event) {
        const cursor = event.target.result;
        if (cursor && filteredResults.length < limit) {
          // 使用 json-logic-js 来评估数据
          if (jsonLogic.apply(jsonLogicRules, cursor.value)) {
            filteredResults.push(cursor.value);
          }
          cursor.continue();
        } else {
          // 遍历结束或达到限制数量，进行排序后返回结果
          if (sortBy) {
            filteredResults.sort((a, b) => {
              if (a[sortBy] < b[sortBy]) return sortOrder === "asc" ? -1 : 1;
              if (a[sortBy] > b[sortBy]) return sortOrder === "asc" ? 1 : -1;
              return 0;
            });
          }
          resolve(filteredResults);
        }
      };
    });
  });
}
