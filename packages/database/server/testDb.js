// testDb.js
import { Level } from "level";

// 初始化 Level 数据库
const dbPath = "../../nolodata/testdb";
const levelDb = new Level(dbPath);

// 导出数据库实例
export default levelDb;
