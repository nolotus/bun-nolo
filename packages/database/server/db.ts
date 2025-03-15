import { Level } from "level";
import path from "path";
import fs from "fs";

// 定义可能的数据库位置
const LEGACY_DB_PATH = "../../nolodata/nolodb"; // 当前路径
const NEW_DB_PATH = path.join(process.cwd(), "data", "leveldb"); // 新路径

// 从环境变量决定是否使用新路径
const USE_NEW_PATH = process.env.USE_NEW_DB_PATH === "true";

// 选择实际使用的路径
const dbPath = USE_NEW_PATH ? NEW_DB_PATH : LEGACY_DB_PATH;

// 确保新路径的目录存在
if (USE_NEW_PATH && !fs.existsSync(path.dirname(NEW_DB_PATH))) {
  fs.mkdirSync(path.dirname(NEW_DB_PATH), { recursive: true });
}

console.log("数据库配置:");
console.log("- 当前工作目录:", process.cwd());
console.log("- 使用新路径:", USE_NEW_PATH);
console.log("- 数据库路径:", dbPath);

const serverDb = new Level(dbPath, { valueEncoding: "json" }) as Level<
  string,
  any
>;

console.log("- LevelDB实际路径:", serverDb.location);

export default serverDb;
