import { Level } from "level";

const dbPath = "../../nolodata/nolodb";
console.log("数据库路径:", dbPath);

const serverDb = new Level(dbPath, { valueEncoding: "json" }) as Level<
  string,
  any
>;

console.log("数据库初始化位置:", serverDb.location);

export default serverDb;
