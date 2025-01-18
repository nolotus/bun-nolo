import readline from "node:readline";
import { extractAndDecodePrefix } from "core/prefix";
import { processLine } from "core/decodeData";
import { DEFAULT_INDEX_FILE } from "database/init";
import fs from "fs";

import { createReadStream } from "node:fs";
import { isV0Id } from "core/id";
import serverDb from "./db";

const findDataInFile = (filePath, id: string) => {
  return new Promise((resolve, reject) => {
    let found = false;
    const input = createReadStream(filePath);
    input.on("error", (err) => reject(err));
    const rl = readline.createInterface({ input });
    rl.on("line", (line) => {
      const [key, value] = processLine(line);
      if (id === key) {
        found = true;
        resolve(value);
        rl.close();
      }
    });

    rl.on("close", () => {
      if (!found) {
        resolve(null);
      }
    });

    rl.on("error", (err) => reject(err));
  });
};

export const handleReadSingle = async (req, res) => {
  if (!req.params.id) {
    return res.status(500).json({ error: "need id" });
  }

  const id = req.params.id;
  if (!isV0Id(id)) {
    const result = serverDb.get(id);
    return res.status(200).json({ ...result, id });
  }
  const { isList } = extractAndDecodePrefix(id);

  try {
    const result = await serverGetData(id);

    if (result) {
      if (isList) {
        return res.status(200).json({ array: [...result], id });
      }
      return res.status(200).json({ ...result, id });
    }
    return res.status(404).json({ error: "Data not found" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred while fetching data" });
  }
};

export const serverGetData = async (id: string) => {
  if (!id) {
    return Promise.resolve(null);
  }

  const parts = id.split("-");
  const userId = parts[1];

  if (!userId) {
    return Promise.resolve(null);
  }

  const indexPath = `./nolodata/${userId}/${DEFAULT_INDEX_FILE}`;

  if (!fs.existsSync(indexPath)) {
    return Promise.resolve(null);
  }

  return findDataInFile(indexPath, id).then((data) => {
    if (data) {
      return data;
    }

    return null;
  });
};
