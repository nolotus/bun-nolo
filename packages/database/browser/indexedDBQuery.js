// indexedDBQuery.js

import { dbOperation } from "./indexedDBActions"; // 假设你的操作函数在另一个文件中

// 查询 IndexedDB 中所有数据的函数
export function queryFromIndexedDB(userId) {
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

// 查询 IndexedDB 中符合特定条件的数据的函数
export function queryFilteredFromIndexedDB(userId, filterFunction) {
  return dbOperation(userId, (store) => {
    return new Promise((resolve, reject) => {
      const filteredResults = [];

      // 使用游标来遍历数据
      const cursorRequest = store.openCursor();
      cursorRequest.onerror = function (event) {
        reject(
          "Error querying filtered data from IndexedDB: " + event.target.error,
        );
      };

      cursorRequest.onsuccess = function (event) {
        const cursor = event.target.result;
        if (cursor) {
          if (filterFunction(cursor.value)) {
            filteredResults.push(cursor.value);
          }
          cursor.continue();
        } else {
          // 遍历结束，返回结果
          resolve(filteredResults);
        }
      };
    });
  });
}
