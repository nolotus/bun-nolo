// read.ts

import { DEFAULT_INDEX_FILE, DEFAULT_HASH_FILE } from "database/init";
import { extractAndDecodePrefix, extractUserId } from "core";
import { checkFileExists } from "utils/file";
import { checkMemoryForData } from "./mem";
import readline from "readline";
import { processLine } from "core/decodeData";
import { createReadStream } from "node:fs";
import { checkReadPermission } from "./permissions";

export const handleReadSingle = async (req, res) => {
  if (!req.params.id) {
    return res.status(500).json({ error: "need id" });
  }
  const id = req.params.id;
  const { isFile, isList } = extractAndDecodePrefix(id);
  const userId = extractUserId(id);

  if (!checkReadPermission(userId, id)) {
    return res.status(404).json({ error: "Data not found (deleted)" });
  }

  //文件单独处理
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

export const findDataInFile = (filePath, id: string) => {
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

export const serverGetData = (id: string) => {
  if (!id) {
    return Promise.resolve(null);
  }

  const parts = id.split("-");
  const userId = parts[1];

  if (!userId) {
    return Promise.resolve(null);
  }

  const indexPath = `./nolodata/${userId}/${DEFAULT_INDEX_FILE}`;
  const hashPath = `./nolodata/${userId}/${DEFAULT_HASH_FILE}`;

  // 首先检查用户目录是否存在
  if (!checkFileExists(indexPath)) {
    return Promise.resolve(null);
  }

  // 检查内存中的数据
  const memResult = checkMemoryForData(id);
  if (memResult !== undefined) {
    return Promise.resolve(memResult);
  }

  // 如果内存中没有，则从文件中查找
  return findDataInFile(indexPath, id).then((data) => {
    if (data) {
      // 如果在文件中找到数据，将其缓存到内存中
      return data;
    }
    //is hash
    if (id.startsWith("1")) {
      if (!checkFileExists(hashPath)) {
        return Promise.resolve(null);
      }

      return findDataInFile(hashPath, id).then((hashData) => {
        if (hashData) {
          // 可能需要在这里添加一些处理逻辑
        }
        return hashData;
      });
    }

    return null;
  });
};
