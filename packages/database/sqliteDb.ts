// packages/database/sqliteDb.ts (修改导入)
import { Database } from "bun:sqlite";
// 从新的后端专属工具文件中导入 getDbFilePath
import { getDbFilePath } from "./utils/dbPath"; // **路径已更新**

const userDatabases = new Map<string, Database>();

/**
 * 获取指定用户的SQLite数据库实例。
 * 如果该用户的数据库实例尚未打开，则会创建并打开它。
 * @param userId 用户的唯一ID。
 * @returns 对应用户的SQLite数据库实例。
 */
export function getSqliteDb(userId: string): Database {
  let dbInstance = userDatabases.get(userId);

  if (!dbInstance) {
    const dbPath = getDbFilePath(userId); // 调用导入的函数

    dbInstance = new Database(dbPath, { create: true });

    dbInstance.exec("PRAGMA journal_mode = WAL;");

    userDatabases.set(userId, dbInstance);

    console.log(`SQLite Database connected for user ${userId}: ${dbPath}`);
  }
  return dbInstance;
}

// 在应用关闭时，关闭所有已打开的用户数据库连接
process.on("beforeExit", () => {
  console.log("Closing all user-specific SQLite database connections...");
  for (const [userId, db] of userDatabases.entries()) {
    try {
      db.close(false);
      console.log(`Closed DB for user ${userId}.`);
    } catch (e) {
      console.error(`Error closing DB for user ${userId}:`, e);
    }
  }
});
