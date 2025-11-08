// database/browser/db.js
import { Level } from "level";

export const browserDb = new Level("nolo", { valueEncoding: "json" });
