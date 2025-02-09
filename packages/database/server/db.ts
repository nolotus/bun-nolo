import { Level } from "level";

const dbPath = "../../nolodata/nolodb";
const serverDb = new Level(dbPath, { valueEncoding: "json" }) as Level<
  string,
  any
>;

export const DB_PREFIX = {
  USER: "user:",
} as const;

export default serverDb;
