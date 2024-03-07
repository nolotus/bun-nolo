import { createReadStream } from "node:fs";
import readline from "readline";

import { processLine } from "core/decodeData";
import { getLogger } from "utils/logger";

const readLogger = getLogger("readAll");

export const serverGetAllData = (userId) => {
  const indexPath = `./nolodata/${userId}/index.nolo`;
  const hashPath = `./nolodata/${userId}/hash.nolo`;

  const indexPromise = readDataFromFile(indexPath, userId).catch(() => []);
  const hashPromise = readDataFromFile(hashPath, userId).catch(() => []);

  return Promise.all([indexPromise, hashPromise]).then(
    ([indexData, hashData]) => {
      // 合并两个数组，忽略空数组
      return [...indexData, ...hashData];
    },
  );
};

const readDataFromFile = (filePath, userId) => {
  return new Promise((resolve, reject) => {
    let data = []; // Array to store all data
    const input = createReadStream(filePath);

    input.on("error", (err) => {
      readLogger.error({ err, filePath }, "Error reading file");
      resolve([]); // Resolve with empty array in case of error
    });

    const rl = readline.createInterface({ input });

    rl.on("line", (line) => {
      const [id, value] = processLine(line);
      if (id && id.includes(userId)) {
        data.push({ id, ...value }); // Add data to array
      }
    });

    rl.on("close", () => {
      readLogger.info({ count: data.length }, "Data read from file");
      resolve(data); // Resolve with all data from current file
    });

    // You can remove this if the 'input' stream already handles 'error' event.
    rl.on("error", (err) => {
      readLogger.error({ err }, "Error in readline");
      reject(err); // Can also resolve like 'input' to avoid Promise.all failure
    });
  });
};

export const handleReadAll = async (req, res) => {
  try {
    const { userId, stream = false } = req.body; // 从请求体中获取 userId 和 stream

    readLogger.info({ userId, stream }, "Received userId and stream options");

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const data = await serverGetAllData(userId, stream); // 传递 userId 和 stream 到 serverGetAllData 函数

    return res.status(200).json(data);
  } catch (err) {
    readLogger.error({ error: err.message }, "Error in handleReadAll function");
    return res.status(500).json({ error: err.message });
  }
};
