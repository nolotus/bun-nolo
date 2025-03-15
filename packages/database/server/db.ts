// database/server/db.js
import { Level } from "level";
import { dirname } from "path";
import { mkdirSync } from "fs";

const dbPath = "../../nolodata/nolodb";
const absolutePath = require("path").resolve(__dirname, dbPath);

// 确保目录存在
try {
  mkdirSync(dirname(absolutePath), { recursive: true });
  console.log(`确保目录存在: ${dirname(absolutePath)}`);
} catch (err) {
  console.error(`创建目录失败: ${err.message}`);
}

const serverDb = new Level(absolutePath, {
  valueEncoding: "json",
  createIfMissing: true,
}) as Level<string, any>;

export default serverDb;
