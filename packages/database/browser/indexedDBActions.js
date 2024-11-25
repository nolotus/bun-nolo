const DB_NAME = "nolo";
const DB_VERSION = 1;

// 通用的数据库操作函数
export function dbOperation(userId, operation) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = function (event) {
      reject("Database error: " + event.target.errorCode);
    };

    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      // 如果之前没有这个用户的store，则创建一个新的
      if (!db.objectStoreNames.contains(userId)) {
        db.createObjectStore(userId, { autoIncrement: true });
      }
    };

    request.onsuccess = function (event) {
      const db = event.target.result;

      // 检查是否存在这个用户的store
      if (!db.objectStoreNames.contains(userId)) {
        reject("User store does not exist");
        db.close();
        return;
      }

      const transaction = db.transaction([userId], "readwrite");
      const store = transaction.objectStore(userId);

      operation(store)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });

      transaction.oncomplete = function () {
        db.close();
      };

      transaction.onerror = function (event) {
        reject("Transaction error: " + event.target.error);
      };
    };
  });
}

// 添加数据到 IndexedDB 的函数
export function addToIndexedDB(data, userId) {
  return dbOperation(userId, (store) => {
    return new Promise((resolve, reject) => {
      const addRequest = store.add(data);

      addRequest.onerror = function (event) {
        reject("Error adding data to IndexedDB: " + event.target.error);
      };

      addRequest.onsuccess = function (event) {
        resolve("Data added to IndexedDB successfully");
      };
    });
  });
}

// 从 IndexedDB 中删除数据的函数
export function deleteFromIndexedDB(userId, key) {
  return dbOperation(userId, (store) => {
    return new Promise((resolve, reject) => {
      const deleteRequest = store.delete(key);

      deleteRequest.onerror = function (event) {
        reject("Error deleting data from IndexedDB: " + event.target.error);
      };

      deleteRequest.onsuccess = function (event) {
        resolve("Data deleted from IndexedDB successfully");
      };
    });
  });
}

// 从 IndexedDB 中获取数据的函数
export function getFromIndexedDB(userId, key) {
  return dbOperation(userId, (store) => {
    return new Promise((resolve, reject) => {
      const getRequest = store.get(key);

      getRequest.onerror = function (event) {
        reject("Error getting data from IndexedDB: " + event.target.error);
      };

      getRequest.onsuccess = function (event) {
        resolve(getRequest.result);
      };
    });
  });
}

// 更新 IndexedDB 中数据的函数
export function updateInIndexedDB(data, userId, key) {
  return dbOperation(userId, (store) => {
    return new Promise((resolve, reject) => {
      const putRequest = store.put(data, key);

      putRequest.onerror = function (event) {
        reject("Error updating data in IndexedDB: " + event.target.error);
      };

      putRequest.onsuccess = function (event) {
        resolve("Data updated in IndexedDB successfully");
      };
    });
  });
}
