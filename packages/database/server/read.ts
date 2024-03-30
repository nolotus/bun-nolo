import { DEFAULT_INDEX_FILE, DEFAULT_HASH_FILE } from "auth/server/init";
import { getLogger } from "utils/logger";
import { extractAndDecodePrefix, extractUserId } from "core";
import { checkFileExists, findDataInFile } from "utils/file";

const readDataLogger = getLogger("readData");

export const handleReadSingle = async (req, res) => {
  const id = req.params.id;
  const { isFile } = extractAndDecodePrefix(id);
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
    readDataLogger.info({ id }, "handleReadSingle result");
    if (result) {
      return res.status(200).json({ ...result, id });
    }
    return res.status(404).json({ error: "Data not found" });
  } catch (error) {
    readDataLogger.error({ error }, "Error fetching data");
    return res
      .status(500)
      .json({ error: "An error occurred while fetching data" });
  }
};

export const serverGetData = (id: string) => {
  readDataLogger.info({ id }, "serverGetData");

  if (!id) {
    readDataLogger.info("id is empty");
    return Promise.resolve(null);
  }

  const parts = id.split("-");
  const userId = parts[1];

  if (!userId) {
    readDataLogger.info("userId is undefined or invalid");
    return Promise.resolve(null);
  }

  const indexPath = `./nolodata/${userId}/${DEFAULT_INDEX_FILE}`;
  const hashPath = `./nolodata/${userId}/${DEFAULT_HASH_FILE}`;

  if (!checkFileExists(indexPath)) {
    readDataLogger.info("index file does not exist");
    return Promise.resolve(null);
  }

  return findDataInFile(indexPath, id).then((data) => {
    if (data) {
      readDataLogger.info("Data found in index file");
      return data;
    }
    //is hash
    if (id.startsWith("1")) {
      if (!checkFileExists(hashPath)) {
        readDataLogger.info("hash file does not exist");
        return Promise.resolve(null);
      }

      readDataLogger.info("Data not found in index file, searching hash file");
      return findDataInFile(hashPath, id).then((hashData) => {
        if (hashData) {
          readDataLogger.info("Data found in hash file");
        } else {
          readDataLogger.info("Data not found in hash file");
        }
        return hashData;
      });
    }
    readDataLogger.info(
      "Data not found in index file, and id does not start with '1'",
    );
    return null;
  });
};
