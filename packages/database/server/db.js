// db.js
import { Level } from "level";

const dbPath = "../../nolodata/nolodb";
const levelDb = new Level(dbPath);


export const DB_PREFIX = {
  USER: 'user:', 
  SPACE: 'space:',
  PAGE: 'page:',
  CYBOT: 'cybot:',
  CHAT: 'chat:',
}


export default levelDb;
