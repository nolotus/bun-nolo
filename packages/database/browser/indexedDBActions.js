const DB_NAME = "nolo";
const DB_VERSION = 1;

export function dbOperation(userId, operation) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = function (event) {
      reject("Database error: " + event.target.errorCode);
    };

    request.onupgradeneeded = function (event) {
      const db = event.target.result;
      // 使用数据的 id 作为 keyPath
      if (!db.objectStoreNames.contains(userId)) {
        db.createObjectStore(userId, { keyPath: "id" });
      }
    };

    request.onsuccess = function (event) {
      const db = event.target.result;

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

// 添加数据的函数 - 数据必须包含 id 字段
export function addToIndexedDB(data, userId) {
  return dbOperation(userId, (store) => {
    return new Promise((resolve, reject) => {
      if (!data.id) {
        reject("Data must contain an id field");
        return;
      }

      const addRequest = store.add(data);

      addRequest.onerror = function (event) {
        reject("Error adding data to IndexedDB: " + event.target.error);
      };

      addRequest.onsuccess = function (event) {
        resolve({ ...data, message: "Data added to IndexedDB successfully" });
      };
    });
  });
}

// 删除数据的函数
export function deleteFromIndexedDB(userId, id) {
  return dbOperation(userId, (store) => {
    return new Promise((resolve, reject) => {
      const deleteRequest = store.delete(id);

      deleteRequest.onerror = function (event) {
        reject("Error deleting data from IndexedDB: " + event.target.error);
      };

      deleteRequest.onsuccess = function (event) {
        resolve(id);
      };
    });
  });
}

// 获取数据的函数
export function getFromIndexedDB(userId, id) {
  return dbOperation(userId, (store) => {
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);

      getRequest.onerror = function (event) {
        reject("Error getting data from IndexedDB: " + event.target.error);
      };

      getRequest.onsuccess = function (event) {
        resolve(getRequest.result);
      };
    });
  });
}

// 更新数据的函数
export function updateInIndexedDB(data, userId) {
  return dbOperation(userId, (store) => {
    return new Promise((resolve, reject) => {
      if (!data.id) {
        reject("Data must contain an id field");
        return;
      }

      const putRequest = store.put(data);

      putRequest.onerror = function (event) {
        reject("Error updating data in IndexedDB: " + event.target.error);
      };

      putRequest.onsuccess = function (event) {
        resolve("Data updated in IndexedDB successfully");
      };
    });
  });
}
