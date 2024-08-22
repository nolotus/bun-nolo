// read.ts

import { DEFAULT_INDEX_FILE, DEFAULT_HASH_FILE } from "database/init";
import { extractAndDecodePrefix, extractUserId } from "core";
import { checkFileExists, findDataInFile } from "utils/file";
import { mem } from "./mem";
import { parseStrWithId } from "core/decodeData";
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

  if (!checkFileExists(indexPath)) {
    return Promise.resolve(null);
  }
  const cacheStr = mem.get(id);
  if (cacheStr) {
    const value = parseStrWithId(id, cacheStr);
    console.log("cache hit", value);
    return value;
  }

  return findDataInFile(indexPath, id).then((data) => {
    if (data) {
      return data;
    }
    //is hash
    if (id.startsWith("1")) {
      if (!checkFileExists(hashPath)) {
        return Promise.resolve(null);
      }

      return findDataInFile(hashPath, id).then((hashData) => {
        if (hashData) {
        } else {
        }
        return hashData;
      });
    }

    return null;
  });
};
