import readline from "node:readline";
import { extractAndDecodePrefix, extractUserId } from "core";
import { decodeData, processLine } from "core/decodeData";
import { DEFAULT_INDEX_FILE } from "database/init";
import fs from "fs";

import { createReadStream } from "node:fs";
import { mem } from "./mem";

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
  const { isFile, isList } = extractAndDecodePrefix(id);
  const userId = extractUserId(id);
  if (isFile) {
    const file = Bun.file(`nolodata/${userId}/${id}`);
    const headers = new Headers({
      "Cache-Control": "max-age=3600",
      "Content-Type": file.type,
    });
    return new Response(file.stream(), { headers });
  }
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

  const memValue = await mem.get(id);
  const flags = extractAndDecodePrefix(id);

  if (memValue) {
    const decodedValue = decodeData(memValue, flags, id);
    // console.log("decodedValue ", decodedValue);
    return Promise.resolve(decodedValue);
  }
  //maybe empty string
  if (memValue === "") {
    if (flags.isList) {
      const decodedValue = decodeData(memValue, flags, id);
      return Promise.resolve(decodedValue);
    }
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
