import { Level } from "level";

const dbPath = "../../nolodata/nolodb";
const serverDb = new Level(dbPath, { valueEncoding: "json" }) as Level<
  string,
  any
>;

export default serverDb;
