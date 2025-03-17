import { Level } from "level";
import path from "path";
import fs from "fs";

// 定义数据库位置
const DB_PATH = path.join(process.cwd(), "data", "leveldb");

// 确保数据库目录存在
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

console.log("数据库配置:");
console.log("- 当前工作目录:", process.cwd());
console.log("- 数据库路径:", DB_PATH);

const serverDb = new Level(DB_PATH, { valueEncoding: "json" }) as Level<
  string,
  any
>;

console.log("- LevelDB实际路径:", serverDb.location);

export default serverDb;
