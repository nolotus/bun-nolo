// db.js
import { Level } from "level";

const dbPath = "../../nolodata/nolodb";
const levelDb = new Level(dbPath);


export const DB_PREFIX = {
    USER: 'user:', 
    KEY: 'key:',
    SESSION: 'session:'
    // 可以继续添加其他前缀
  }
  
export default levelDb;
