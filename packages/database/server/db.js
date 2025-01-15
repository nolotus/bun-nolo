// db.js
import { Level } from "level";

const dbPath = "../../nolodata/nolodb";
const serverDb = new Level(dbPath, { valueEncoding: "json" });


export const DB_PREFIX = {
  USER: 'user:', 
  // SPACE: 'space:',
  // PAGE: 'page:',
  // CYBOT: 'cybot:',
  // CHAT: 'chat:',
}


export default serverDb;
