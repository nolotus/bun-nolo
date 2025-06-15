// packages/database/utils/dbPath.ts (新建文件)
import path from "path";
import fs from "fs";

// --- 路径计算和目录创建逻辑 ---

// 使用 import.meta.dir 获取当前文件 (packages/database/utils/dbPath.ts) 的目录。
const CURRENT_FILE_DIR = import.meta.dir;
// => /path/to/BUN-NOLO/packages/database/utils

// 构建项目根目录 (BUN-NOLO) 的绝对路径：
// 从当前文件目录向上退三级 ('..', '..', '..')
const PROJECT_ROOT = path.join(CURRENT_FILE_DIR, "..", "..", "..");
// => /path/to/BUN-NOLO

// 构建数据根目录的绝对路径：在项目根目录下找到 'data' 目录
const DATA_BASE_DIRECTORY = path.join(PROJECT_ROOT, "data");
// => /path/to/BUN-NOLO/data

// 构建用户数据库文件的存放目录的绝对路径：在 'data' 目录下创建 'user_dbs'
const USER_DATABASES_DIRECTORY = path.join(DATA_BASE_DIRECTORY, "user_dbs");
// => /path/to/BUN-NOLO/data/user_dbs

/**
 * 辅助函数：确保指定目录存在。
 * @param dirPath 要检查或创建的目录路径。
 */
function ensureDirectoryExists(dirPath: string) {
  try {
    fs.mkdirSync(dirPath, { recursive: true });
  } catch (e: any) {
    if (e.code !== "EEXIST") {
      console.error(`Error creating directory ${dirPath}:`, e);
      throw e;
    }
  }
}

/**
 * 根据用户ID获取其专属SQLite数据库文件的完整路径。
 * @param userId 用户的唯一ID。
 * @returns 对应用户SQLite数据库文件的完整路径。
 */
export function getDbFilePath(userId: string): string {
  ensureDirectoryExists(USER_DATABASES_DIRECTORY);
  return path.join(USER_DATABASES_DIRECTORY, `${userId}.sqlite`);
}
